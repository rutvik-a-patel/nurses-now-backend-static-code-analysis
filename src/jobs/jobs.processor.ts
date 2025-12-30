import { AutoSchedulingService } from '@/shared/helpers/auto-scheduling';
import logger from '@/shared/helpers/logger';
import { ShiftService } from '@/shift/shift.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('auto-scheduling')
export class JobsProcessor {
  constructor(
    private readonly autoSchedulingService: AutoSchedulingService,
    private readonly shiftService: ShiftService,
  ) {}

  @Process({ name: 'run-auto-scheduling', concurrency: 3 }) // Reduced concurrency
  async handleAutoScheduling(job: Job) {
    const instanceId = process.env.NODE_APP_INSTANCE || 'unknown';
    const { providers, shift, setting, count, status, req } = job.data;

    logger.error(
      `🔵 Instance ${instanceId}: Starting job ${job.id} for shift ${shift.id}`,
    );

    try {
      const result = await this.autoSchedulingService.runAutoScheduling(
        providers,
        shift,
        setting,
        count,
        status,
        req,
      );

      logger.error(
        `✅ Instance ${instanceId}: Completed job ${job.id} for shift ${shift.id}`,
      );
      return result;
    } catch (error) {
      logger.error(
        `❌ Instance ${instanceId}: Job ${job.id} failed: ${error.message}`,
      );
      // Re-throw to let Bull handle retries
      throw error;
    }
  }
}
