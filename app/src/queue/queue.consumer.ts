import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';
import { EmailService } from '../email/email.service';
import { Logger } from '@nestjs/common';

@Processor(QUEUE_NAMES.EMAIL)
export class QueueConsumer extends WorkerHost {
  private readonly logger = new Logger(QueueConsumer.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      this.logger.log(`Processing email job ${job.id}`);
      await this.emailService.sendEmail(job.data);
      this.logger.log(`Email job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to process email job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
