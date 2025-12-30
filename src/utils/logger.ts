import pino from 'pino';
import { env } from "../config/env";

const logger =
    env.NODE_ENV === "development"
        ? pino({
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                },
            },
        })
        : pino();

export default logger;