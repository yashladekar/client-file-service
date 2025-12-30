import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 8084)),
    NODE_ENV: z
        .string()
        .optional()
        .transform((val) => {
            const normalized = (val ?? "development").trim().toLowerCase();
            if (normalized === "dev") return "development";
            if (normalized === "prod") return "production";
            return normalized;
        })
        .pipe(z.enum(["development", "production", "test"])),
    DATABASE_URL: z.string(),
    JWT_SECRET: z
        .string()
        .transform((val) => val.trim()),
    REDIS_URL: z.string().url(),
});

const _env = envSchema.parse(process.env);

export const env = {
    PORT: _env.PORT,
    NODE_ENV: _env.NODE_ENV,
    DATABASE_URL: _env.DATABASE_URL,
    JWT_SECRET: _env.JWT_SECRET,
    REDIS_URL: _env.REDIS_URL,
};
