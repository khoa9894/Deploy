import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Processor(QUEUE_NAMES.TASK_EXPIRATION)
export class TaskExpirationConsumer extends WorkerHost {
  private readonly logger = new Logger(TaskExpirationConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      this.logger.log(`Processing task expiration check job ${job.id}`);

      // Calculate date range: today to 3 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      threeDaysFromNow.setHours(23, 59, 59, 999);

      // Find tasks that will expire within 3 days
      const expiringTasks = await this.prisma.task.findMany({
        where: {
          due_date: {
            gte: today,
            lte: threeDaysFromNow,
          },
        },
        include: {
          user: true,
        },
      });

      this.logger.log(
        `Found ${expiringTasks.length} tasks expiring within 3 days`,
      );

      if (expiringTasks.length === 0) {
        return { processed: 0 };
      }

      // Send emails in parallel using Promise.allSettled
      const emailResults = await Promise.allSettled(
        expiringTasks.map((task) =>
          this.emailService.sendEmail({
            to: task.user.email,
            subject: `Task Expiration: ${task.title}`,
            message: `The task "${task.title}" is due to expire on ${task.due_date?.toLocaleDateString()}.`,
          }),
        ),
      );

      // Count successes and failures
      const succeeded = emailResults.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const failed = emailResults.filter((r) => r.status === 'rejected').length;

      // Log failed emails
      emailResults.forEach((result, idx) => {
        if (result.status === 'rejected') {
          this.logger.warn(
            `Failed to send email for task "${expiringTasks[idx].title}": ${result.reason}`,
          );
        }
      });

      this.logger.log(
        `Task expiration check completed: ${succeeded} notifications sent, ${failed} failed`,
      );

      return { processed: succeeded, failed };
    } catch (error) {
      this.logger.error(
        `Error processing task expiration check: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}