import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
