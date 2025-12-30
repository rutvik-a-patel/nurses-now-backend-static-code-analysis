import { BullModuleOptions } from '@nestjs/bull';

export const bullConfig: BullModuleOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    timeout: 300000,
  },
  settings: {
    stalledInterval: 30000,
    maxStalledCount: 2,
    guardInterval: 5000,
    retryProcessDelay: 5000,
  },
};

// Factory function for async configuration
export const bullAsyncConfig = {
  useFactory: async (): Promise<BullModuleOptions> => {
    return {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        timeout: 300000,
      },
      settings: {
        stalledInterval: 30000,
        maxStalledCount: 2,
        guardInterval: 5000,
        retryProcessDelay: 5000,
      },
    };
  },
};

// Queue-specific configuration
export const autoSchedulingQueueConfig = {
  name: 'auto-scheduling',
};

// Async queue configuration
export const autoSchedulingQueueAsyncConfig = {
  name: 'auto-scheduling',
  useFactory: async () => ({
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      timeout: 300000,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }),
};
