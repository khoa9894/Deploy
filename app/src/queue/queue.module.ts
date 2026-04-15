import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueConsumer } from './queue.consumer';
import { TaskExpirationConsumer } from './task-expiration.consumer';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      {
        name: QUEUE_NAMES.EMAIL,
      },
      {
        name: QUEUE_NAMES.TASK_EXPIRATION,
      },
    ),
  ],
  providers: [QueueService, QueueConsumer, TaskExpirationConsumer],
  exports: [QueueService],
})
export class QueueModule {}
