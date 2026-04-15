import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TaskExpirationCheckResultDto } from './dto/queue.dto';
import { SendEmailDto } from '../email/dto/send-email.dto';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAMES.TASK_EXPIRATION)
export class TaskExpirationConsumer extends WorkerHost {
  private readonly logger = new Logger(TaskExpirationConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job): Promise<TaskExpirationCheckResultDto> {
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
        return { sent: 0, failed: 0, total: 0 };
      }

      const emailRequests: SendEmailDto[] = expiringTasks.map((task) => ({
        to: task.user.email,
        subject: `Task Expiration: ${task.title}`,
        message: `The task "${task.title}" is due to expire on ${task.due_date?.toLocaleDateString()}.`,
      }));

      const emailResults = await Promise.allSettled(
        emailRequests.map((email) => this.emailService.sendEmail(email)),
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

      const result: TaskExpirationCheckResultDto = {
        sent: succeeded,
        failed,
        total: expiringTasks.length,
      };

      this.logger.log('Check completed', result);

      return result;
    } catch (error) {
      this.logger.error('Check failed', error, { jobId: job.id });
      throw error;
    }
  }
}

