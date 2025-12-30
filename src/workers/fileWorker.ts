import { Worker } from "bullmq";
import xlsx from "xlsx";
import fs from "fs";
import prisma from "../config/db";
import { connection } from "../config/redis";
import { clientRowSchema } from "../schemas/clientSchema";
import logger from "../utils/logger";

const worker = new Worker("file-import-queue", async (job) => {
    const { fileId, filePath } = job.data;
    logger.info(`[Job ${job.id}] Processing file: ${fileId}`);

    try {
        // 1. Mark as Processing
        await prisma.fileUpload.update({
            where: { id: fileId },
            data: { status: "PROCESSING" },
        });

        // 2. Read File
        if (!fs.existsSync(filePath)) throw new Error("File not found on disk");

        const buffer = fs.readFileSync(filePath);
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 3. Validate & Transform
        const validRecords = [];
        const errors = [];

        for (const [index, row] of rawData.entries()) {
            const result = clientRowSchema.safeParse(row);
            if (result.success) {
                validRecords.push(result.data);
            } else {
                errors.push({ row: index + 2, error: result.error.errors[0].message });
            }
        }

        // 4. Bulk Insert (Transactional)
        if (validRecords.length > 0) {
            // Prisma createMany is faster for bulk operations
            await prisma.clientData.createMany({
                data: validRecords.map(r => ({
                    name: r.Name,
                    email: r.Email,
                    phone: r.Phone,
                    fileId: fileId
                })),
                skipDuplicates: true // Skip if email already exists
            });
        }

        // 5. Cleanup & Success
        fs.unlinkSync(filePath); // Delete local file

        await prisma.fileUpload.update({
            where: { id: fileId },
            data: { status: "PARSED", error: errors.length > 0 ? `${errors.length} rows failed` : null }
        });

        logger.info(`[Job ${job.id}] Completed. Imported: ${validRecords.length}, Failed: ${errors.length}`);

    } catch (error: any) {
        logger.error(`[Job ${job.id}] Failed: ${error.message}`);

        await prisma.fileUpload.update({
            where: { id: fileId },
            data: { status: "FAILED", error: error.message }
        });

        // Don't throw if you want the job to be marked "completed" in BullMQ 
        // even if the business logic failed. Throwing triggers BullMQ retries.
    }

}, { connection, concurrency: 5 }); // Process 5 files at once

export default worker;