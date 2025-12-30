import { Worker } from "bullmq";
import xlsx from "xlsx";
import fs from "fs";
import prisma from "../config/db";
import { connection } from "../config/redis";
import { normalizeSapRow, detectSchema } from "../utils/excelNormalizer";
import logger from "../utils/logger";

interface JobData {
    fileId: string;
    filePath: string;
}

const worker = new Worker(
    "file-import-queue",
    async (job) => {
        const { fileId, filePath } = job.data as JobData;

        let currentSystemId: string | null = null;
        let currentComponentId: string | null = null;

        try {
            await prisma.fileUpload.update({
                where: { id: fileId },
                data: { status: "PROCESSING" },
            });

            const buffer = fs.readFileSync(filePath);
            const workbook = xlsx.read(buffer, { type: "buffer" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, {
                defval: null,
            });

            const schema = detectSchema(rows[0]);

            for (const raw of rows) {
                const row = normalizeSapRow(raw, schema);

                // ───── SYSTEM ─────
                if (row.sid) {
                    const system = await prisma.sapSystem.upsert({
                        where: { sid: row.sid },
                        update: {
                            vendor: row.vendor,
                            location: row.location,
                            landscape: row.landscape,
                        },
                        create: {
                            sid: row.sid,
                            vendor: row.vendor,
                            location: row.location,
                            landscape: row.landscape,
                        },
                    });
                    currentSystemId = system.id;
                }

                if (!currentSystemId) continue;

                // ───── COMPONENT ─────
                if (row.componentName && row.componentVersion) {
                    const component = await prisma.sapComponent.upsert({
                        where: {
                            systemId_name_version: {
                                systemId: currentSystemId,
                                name: row.componentName,
                                version: row.componentVersion,
                            },
                        },
                        update: {},
                        create: {
                            systemId: currentSystemId,
                            name: row.componentName,
                            version: row.componentVersion,
                            mainProduct: row.mainProduct,
                        },
                    });

                    currentComponentId = component.id;
                }

                if (!currentComponentId) continue;

                // ───── SUB-COMPONENT ─────
                if (row.subComponentName) {
                    await prisma.sapSubComponent.create({
                        data: {
                            componentId: currentComponentId,
                            name: row.subComponentName,
                            version: row.subComponentVersion,
                            vendor: row.vendor,
                            os: row.os,
                        },
                    });
                }
            }

            fs.unlinkSync(filePath);

            await prisma.fileUpload.update({
                where: { id: fileId },
                data: { status: "PARSED" },
            });

            logger.info(`[Job ${job.id}] SAP file parsed`);
        } catch (err: any) {
            logger.error(err);

            await prisma.fileUpload.update({
                where: { id: fileId },
                data: { status: "FAILED", error: err.message },
            });
        }
    },
    { connection, concurrency: 2 }
);

export default worker;
