import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue(QUEUE_NAMES.EMAIL) private emailQueue: Queue) {}

  async sendEmail(data: { to: string; subject: string; message: string }) {
    return await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  }
}
