// src/shared/helpers/redis-lock.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisLockService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: 6379,
      db: parseInt(process.env.REDIS_DB) || 0,
    });
  }

  async acquireLock(lockKey: string, ttl = 60000): Promise<boolean> {
    try {
      const result = await this.redis.set(lockKey, 'locked', 'PX', ttl, 'NX');
      return result === 'OK';
    } catch (_error) {
      return false;
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    try {
      await this.redis.del(lockKey);
    } catch (_error) {}
  }

  async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    ttl = 60000,
  ): Promise<T> {
    const acquired = await this.acquireLock(lockKey, ttl);
    if (!acquired) {
      throw new Error(
        `Could not acquire lock for ${lockKey}. Another instance is processing this shift.`,
      );
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  async getLockStatus(
    lockKey: string,
  ): Promise<{ isLocked: boolean; ttl: number }> {
    try {
      const ttl = await this.redis.pttl(lockKey);
      return {
        isLocked: ttl > -2, // -2 means key doesn't exist, -1 means no expiry
        ttl: ttl > 0 ? ttl : 0,
      };
    } catch (_error) {
      return { isLocked: false, ttl: 0 };
    }
  }
}
