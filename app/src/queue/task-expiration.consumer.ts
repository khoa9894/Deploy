import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AppLogger } from '../common/logger';

@Processor(QUEUE_NAMES.TASK_EXPIRATION)
export class TaskExpirationConsumer extends WorkerHost {
  private readonly logger = new AppLogger(TaskExpirationConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      this.logger.debug('Starting check', { jobId: job.id });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);

      const expiringTasks = await this.prisma.task.findMany({
        where: {
          due_date: { gte: today, lte: threeDaysFromNow },
        },
        include: { user: true },
      });

      this.logger.log('Found expiring tasks', { count: expiringTasks.length });

      if (expiringTasks.length === 0) {
        return { processed: 0 };
      }

      const emailResults = await Promise.allSettled(
        expiringTasks.map((task) =>
          this.emailService.sendEmail({
            to: task.user.email,
            subject: `Task Expiration: ${task.title}`,
            message: `The task "${task.title}" is due to expire on ${task.due_date?.toLocaleDateString()}.`,
          }),
        ),
      );

      const succeeded = emailResults.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const failed = emailResults.filter((r) => r.status === 'rejected').length;

      emailResults.forEach((result, idx) => {
        if (result.status === 'rejected') {
          this.logger.warn('Failed to send notification', {
            taskTitle: expiringTasks[idx].title,
            email: expiringTasks[idx].user.email,
          });
        }
      });

      this.logger.log('Check completed', {
        sent: succeeded,
        failed,
        total: expiringTasks.length,
      });

      return { processed: succeeded, failed };
    } catch (error) {
      this.logger.error('Check failed', error, { jobId: job.id });
      throw error;
    }
  }
}
