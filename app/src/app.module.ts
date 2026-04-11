import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [AuthModule, TaskModule, ConfigModule.forRoot({ isGlobal: true }), QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
