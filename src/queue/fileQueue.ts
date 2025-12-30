import { Queue } from "bullmq";
import { connection } from "../config/redis";

export const fileQueue = new Queue("file-import-queue", { connection });