import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import logger from '@/shared/helpers/logger';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: any;

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = createClient({ url: 'redis://localhost:6379' });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.redisAdapter = createAdapter(pubClient, subClient);
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    if (this.redisAdapter) {
      server.adapter(this.redisAdapter);
    }

    return server;
  }
}
