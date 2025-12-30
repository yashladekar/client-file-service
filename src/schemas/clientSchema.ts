import { z } from "zod";

export const clientRowSchema = z.object({
    Name: z.string().min(1),
    Email: z.string().email(),
    Phone: z.union([z.string(), z.number()]).transform(String).optional(),
});