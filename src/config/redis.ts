import IORedis from 'ioredis';
import { env } from './env';

// Shared connection for BullMQ to avoid max-connection errors
export const connection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
});