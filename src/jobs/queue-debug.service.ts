import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import logger from '@/shared/helpers/logger';

@Injectable()
export class QueueDebugService implements OnModuleInit {
  private jobTrackingMap = new Map<
    string,
    {
      addedAt: Date;
      startedAt?: Date;
      completedAt?: Date;
      failedAt?: Date;
      shiftId: string;
      status: 'added' | 'started' | 'completed' | 'failed';
    }
  >();

  constructor(
    @InjectQueue('auto-scheduling') private autoSchedulingQueue: Queue,
  ) {}

  async onModuleInit() {
    this.setupQueueListeners();
    await this.logQueueStatus();

    // Log every 30 seconds and check for stuck jobs
    setInterval(() => {
      this.logQueueStatus();
      this.checkForStuckJobs();
    }, 30000);
  }

  private setupQueueListeners() {
    // Track when jobs are added to the queue
    this.autoSchedulingQueue.on('global:added', (jobId) => {
      logger.error(`➕ Job ${jobId} added to queue`);
    });

    this.autoSchedulingQueue.on('completed', (job: Job, _result) => {
      this.trackJobCompletion(job);
      logger.error(`✅ Job ${job.id} completed for shift ${job.data.shift.id}`);
    });

    this.autoSchedulingQueue.on('failed', (job: Job, error) => {
      this.trackJobFailure(job);
      logger.error(`❌ Job ${job.id} failed: ${error.message}`, error.stack);
    });

    this.autoSchedulingQueue.on('active', (job: Job) => {
      this.trackJobStart(job);
      logger.error(
        `🔵 Job ${job.id} is now active for shift ${job.data.shift.id}`,
      );
    });

    this.autoSchedulingQueue.on('waiting', (jobId) => {
      logger.error(`🟡 Job ${jobId} is waiting`);
    });

    this.autoSchedulingQueue.on('stalled', (job: Job) => {
      logger.error(`⚠️ Job ${job.id} stalled for shift ${job.data.shift.id}`);
    });

    // Global events for better tracking
    this.autoSchedulingQueue.on('global:waiting', (jobId) => {
      logger.error(`🌍 Global: Job ${jobId} waiting`);
    });

    this.autoSchedulingQueue.on('global:active', (jobId) => {
      logger.error(`🌍 Global: Job ${jobId} active`);
    });

    this.autoSchedulingQueue.on('global:completed', async (jobId) => {
      logger.error(`🌍 Global: Job ${jobId} completed`);

      // Try to find this job in our tracking and mark it completed
      const tracking = this.jobTrackingMap.get(jobId.toString());
      if (tracking && tracking.status !== 'completed') {
        tracking.completedAt = new Date();
        tracking.status = 'completed';
        logger.error(`📝 Marked job ${jobId} as completed via global event`);
      } else if (!tracking) {
        // Job completed but we never tracked it - might be from another instance
        logger.warn(`🤔 Job ${jobId} completed but was not tracked locally`);
      }
    });

    this.autoSchedulingQueue.on('global:failed', async (jobId) => {
      logger.error(`🌍 Global: Job ${jobId} failed`);

      const tracking = this.jobTrackingMap.get(jobId.toString());
      if (tracking && tracking.status !== 'failed') {
        tracking.failedAt = new Date();
        tracking.status = 'failed';
        logger.error(`📝 Marked job ${jobId} as failed via global event`);
      }
    });
  }

  // Track job when it's added (call this from your service)
  trackJobAdded(job: Job) {
    this.jobTrackingMap.set(job.id.toString(), {
      addedAt: new Date(),
      shiftId: job.data.shift.id,
      status: 'added',
    });
    logger.error(`📝 Tracking job ${job.id} for shift ${job.data.shift.id}`);
  }

  private trackJobStart(job: Job) {
    const tracking = this.jobTrackingMap.get(job.id.toString());
    if (tracking) {
      tracking.startedAt = new Date();
      tracking.status = 'started';
      logger.error(`🚀 Job ${job.id} started processing`);
    }
  }

  private trackJobCompletion(job: Job) {
    const tracking = this.jobTrackingMap.get(job.id.toString());
    if (tracking) {
      tracking.completedAt = new Date();
      tracking.status = 'completed';

      const processingTime =
        tracking.completedAt.getTime() -
        (tracking.startedAt || tracking.addedAt).getTime();
      logger.error(`⏱️ Job ${job.id} completed in ${processingTime}ms`);
    }
  }

  private trackJobFailure(job: Job) {
    const tracking = this.jobTrackingMap.get(job.id.toString());
    if (tracking) {
      tracking.failedAt = new Date();
      tracking.status = 'failed';
      logger.error(
        `💥 Job ${job.id} failed after ${job.attemptsMade} attempts`,
      );
    }
  }

  // Check for jobs that were added but never started
  private async checkForStuckJobs() {
    const stuckJobs = Array.from(this.jobTrackingMap.entries())
      .filter(([_, tracking]) => tracking.status === 'added')
      .filter(([_, tracking]) => {
        const timeSinceAdded = Date.now() - tracking.addedAt.getTime();
        return timeSinceAdded > 60000; // More than 1 minute
      });

    if (stuckJobs.length > 0) {
      logger.error(
        `🔴 Found ${stuckJobs.length} stuck jobs that were added but never started:`,
      );

      stuckJobs.forEach(([jobId, tracking]) => {
        const stuckTime = Date.now() - tracking.addedAt.getTime();
        logger.error(
          `   Job ${jobId} (Shift: ${tracking.shiftId}) - Stuck for ${Math.round(stuckTime / 1000)}s`,
        );
      });

      // Also check the actual queue state
      const waitingJobs = await this.autoSchedulingQueue.getJobs(
        ['waiting'],
        0,
        50,
      );
      const activeJobs = await this.autoSchedulingQueue.getJobs(
        ['active'],
        0,
        50,
      );

      logger.error(
        `Queue State - Waiting: ${waitingJobs.length}, Active: ${activeJobs.length}`,
      );
    }
  }

  async logQueueStatus() {
    try {
      const counts = await this.autoSchedulingQueue.getJobCounts();
      logger.error('📊 Queue Status:', counts);

      // Log detailed information about waiting jobs
      const waitingJobs = await this.autoSchedulingQueue.getJobs(
        ['waiting'],
        0,
        20,
      );
      if (waitingJobs.length > 0) {
        logger.error(`⏳ ${waitingJobs.length} jobs waiting:`);
        waitingJobs.forEach((job) => {
          const tracking = this.jobTrackingMap.get(job.id.toString());
          const waitTime = tracking
            ? Date.now() - tracking.addedAt.getTime()
            : 'Unknown';
          logger.error(
            `   - Job ${job.id}: Shift ${job.data.shift.id}, Waiting for ${Math.round(Number(waitTime) / 1000)}s`,
          );
        });
      }

      // Log active jobs
      const activeJobs = await this.autoSchedulingQueue.getJobs(
        ['active'],
        0,
        10,
      );
      if (activeJobs.length > 0) {
        logger.error(`🔵 ${activeJobs.length} jobs active:`);
        activeJobs.forEach((job) => {
          const tracking = this.jobTrackingMap.get(job.id.toString());
          if (tracking && tracking.startedAt) {
            const activeTime = Date.now() - tracking.startedAt.getTime();
            logger.error(
              `   - Job ${job.id}: Shift ${job.data.shift.id}, Active for ${Math.round(activeTime / 1000)}s`,
            );
          }
        });
      }

      // Log tracking map summary
      logger.error(`📋 Tracking ${this.jobTrackingMap.size} jobs total`);
    } catch (error) {
      logger.error('Error checking queue status:', error);
    }
  }

  // Get jobs that were added but never started
  getStuckJobs() {
    return Array.from(this.jobTrackingMap.entries())
      .filter(([_, tracking]) => tracking.status === 'added')
      .map(([jobId, tracking]) => ({
        jobId,
        shiftId: tracking.shiftId,
        addedAt: tracking.addedAt,
        stuckFor:
          Math.round((Date.now() - tracking.addedAt.getTime()) / 1000) + 's',
      }));
  }

  // Get all tracked jobs with their status
  getAllTrackedJobs() {
    const jobs = [];
    for (const [jobId, tracking] of this.jobTrackingMap.entries()) {
      jobs.push({
        jobId,
        shiftId: tracking.shiftId,
        status: tracking.status,
        addedAt: tracking.addedAt,
        startedAt: tracking.startedAt,
        completedAt: tracking.completedAt,
        failedAt: tracking.failedAt,
        duration: tracking.startedAt
          ? tracking.completedAt
            ? tracking.completedAt.getTime() - tracking.startedAt.getTime()
            : Date.now() - tracking.startedAt.getTime()
          : null,
      });
    }
    return jobs;
  }

  // Clear old completed jobs from tracking to prevent memory leaks
  cleanupOldJobs() {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    for (const [jobId, tracking] of this.jobTrackingMap.entries()) {
      if (
        tracking.completedAt &&
        now - tracking.completedAt.getTime() > twentyFourHours
      ) {
        this.jobTrackingMap.delete(jobId);
      }
    }
  }
}
