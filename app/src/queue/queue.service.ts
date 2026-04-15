import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { QUEUE_NAMES } from './queue.constants';

@Injectable()
export class QueueService {
  private emailQueue: Queue;

  constructor() {
    const connection = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
    });

    this.emailQueue = new Queue(QUEUE_NAMES.EMAIL, { connection });
  }

  async sendEmail(data: { to: string; subject: string }) {
    await this.emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });
  }
}