import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.TASK_EXPIRATION)
    private taskExpirationQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule the task expiration check job at 9 AM daily
    await this.scheduleTaskExpirationCheck();
  }

  async sendEmail(data: { to: string; subject: string; message: string }) {
    return await this.emailQueue.add('send-email', data, {
      attempts: 3,
      delay: 3000,
      removeOnComplete: 3,
    });
  }

  async scheduleTaskExpirationCheck() {
    // Remove existing recurring job if any
    const existingJobs = await this.taskExpirationQueue.getJobSchedulers();
    for (const job of existingJobs) {
      if (job.name === 'check-expiring-tasks') {
        if (job.id) {
          await this.taskExpirationQueue.removeJobScheduler(job.id);
          this.logger.log('Removed existing task expiration check job');
        }
      }
    }

    // Add recurring job every 1 minute (*/1 * * * *)
    const job = await this.taskExpirationQueue.add(
      'check-expiring-tasks',
      {},
      {
        repeat: {
          pattern: '*/1 * * * *', // Every 1 minute
        },
        removeOnComplete: true,
      },
    );

    this.logger.log(
      `Task expiration check scheduled every 1 minute with job ID: ${job.id}`,
    );
  }
}
