import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { QueueService } from './queue.service';

@Processor(QUEUE_NAMES.TASK_EXPIRATION)
export class TaskExpirationConsumer extends WorkerHost {
  private readonly logger = new Logger(TaskExpirationConsumer.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
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
          user: true, // Include user info if needed
        },
      });

      this.logger.log(
        `Found ${expiringTasks.length} tasks expiring within 3 days`,
      );

      if (expiringTasks.length > 0) {
        this.logger.debug(`Expiring tasks:`, expiringTasks);
        expiringTasks.forEach(async (task) => {
          this.logger.log(
            `Task "${task.title}" expires on ${task.due_date?.toLocaleDateString()}`,
          );

          await this.queue.sendEmail({
            to: task.user.email,
            subject: `Task Expiration: ${task.title}`,
            message: `The task "${task.title}" is due to expire on ${task.due_date?.toLocaleDateString()}.`,
          });
        });
      }

      return { processed: expiringTasks.length };
    } catch (error) {
      this.logger.error(
        `Error processing task expiration check: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
