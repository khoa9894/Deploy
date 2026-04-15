import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueConsumer } from './queue.consumer';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.EMAIL,
    }),
  ],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService],
})
export class QueueModule {}
