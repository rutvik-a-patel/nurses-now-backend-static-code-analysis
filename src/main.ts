import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: false,
  });

  const port = process.env.PORT || 4008;
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enable('trust proxy', true);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);
  app.use(compression({ threshold: 512 }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 👇 Bull Board Setup
  const autoschedulingQueue = app.get<Queue>(getQueueToken('auto-scheduling')); // Use your queue name
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullAdapter(autoschedulingQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(+port);
}
bootstrap();
