import { Request, Response } from "express";
import prisma from "../config/db";
import { fileQueue } from "../queue/fileQueue";
import logger from "../utils/logger";

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }

    try {
        // 1. Create DB Record
        const fileRecord = await prisma.fileUpload.create({
            data: {
                filename: req.file.originalname,
                path: req.file.path,
                status: "UPLOADED"
            }
        });

        // 2. Add to Queue
        await fileQueue.add("excel-import", {
            fileId: fileRecord.id,
            filePath: req.file.path
        });

        logger.info(`File queued: ${fileRecord.id}`);

        res.status(202).json({
            message: "File accepted for processing",
            ticketId: fileRecord.id,
            statusEndpoint: `/api/files/status/${fileRecord.id}`
        });

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const record = await prisma.fileUpload.findUnique({ where: { id } });
        if (!record) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
        res.json({ status: record.status, error: record.error });
    } catch (error) {
        res.status(500).json({ message: "Error checking status" });
    }
};