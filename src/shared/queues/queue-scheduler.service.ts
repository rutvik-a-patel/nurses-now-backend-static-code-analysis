// src/shared/queues/queue-monitor.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import logger from '../helpers/logger';

@Injectable()
export class QueueMonitorService implements OnModuleInit, OnModuleDestroy {
  private monitorInterval: NodeJS.Timeout;

  constructor(
    @InjectQueue('auto-scheduling') private readonly autoSchedulingQueue: Queue,
  ) {}

  async onModuleInit() {
    this.startQueueMonitoring();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for queue events
    this.autoSchedulingQueue.on('stalled', (job: Job) => {
      logger.error(`Job ${job.id} stalled and will be retried`);
    });

    this.autoSchedulingQueue.on('failed', (job: Job, error) => {
      logger.error(`Job ${job.id} failed: ${error.message}`);
    });

    this.autoSchedulingQueue.on('error', (error) => {
      logger.error(`Queue error: ${error.message}`);
    });

    logger.info('🔍 Queue Monitor started for auto-scheduling queue');
  }

  private startQueueMonitoring() {
    // Monitor queue status periodically
    this.monitorInterval = setInterval(async () => {
      try {
        const counts = await this.autoSchedulingQueue.getJobCounts();
        const _waiting = await this.autoSchedulingQueue.getWaiting();
        const active = await this.autoSchedulingQueue.getActive();

        logger.debug(
          `Queue Status - Waiting: ${counts.waiting}, Active: ${counts.active}, Completed: ${counts.completed}`,
        );

        // Log stalled jobs
        if (active.length > 0) {
          active.forEach((job) => {
            const processingTime = Date.now() - job.processedOn;
            if (processingTime > 300000) {
              // 5 minutes
              logger.error(
                `Job ${job.id} has been processing for ${Math.round(processingTime / 1000)}s`,
              );
            }
          });
        }
      } catch (error) {
        logger.error('Error monitoring queue:', error);
      }
    }, 60000); // Check every minute
  }

  async getQueueMetrics() {
    const counts = await this.autoSchedulingQueue.getJobCounts();
    const waiting = await this.autoSchedulingQueue.getWaiting();
    const active = await this.autoSchedulingQueue.getActive();
    const delayed = await this.autoSchedulingQueue.getDelayed();
    const failed = await this.autoSchedulingQueue.getFailed();

    return {
      counts,
      waiting: waiting.length,
      active: active.length,
      delayed: delayed.length,
      failed: failed.length,
      timestamp: new Date().toISOString(),
    };
  }

  onModuleDestroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  }
}
