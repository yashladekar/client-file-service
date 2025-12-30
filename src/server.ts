import dotenv from 'dotenv';
dotenv.config(); // Load .env first

import app from './app';
import logger from './utils/logger';
import { env } from './config/env';
const PORT = env.PORT;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} as ${env.NODE_ENV} as http://localhost:${PORT}`);
});

// Graceful Shutdown Logic
const gracefulShutdown = () => {
    logger.info('Received kill signal, shutting down gracefully');
    server.close(() => {
        logger.info('Closed out remaining connections');
        process.exit(0);
    });

    // Force close if it takes too long (e.g., 10 seconds)
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);