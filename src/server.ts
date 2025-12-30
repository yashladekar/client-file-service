import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { env } from './config/env';
import './workers/fileWorker'; // <--- Just importing this file starts the worker!

const PORT = env.PORT;

const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} as ${env.NODE_ENV}`);
});

// ... (Rest of your shutdown logic stays the same) ...