import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { Job } from 'bullmq';

@Processor(QUEUE_NAMES.EMAIL)
export class QueueConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`Sending email for job ${job.id} with data:`, job.data);

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
