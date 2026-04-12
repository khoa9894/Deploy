import { Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskService } from './task.service';
import { RetrieveTaskDto } from './dto/retrieve-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(): RetrieveTaskDto[] {
    return [];
  }

  @Post()
  create(): void {
    // Implementation for creating a task would go here
  }

  @Patch(':id')
  update(): void {
    // Implementation for updating a task would go here
  }

  @Delete(':id')
  remove(): void {
    // Implementation for deleting a task would go here
  }
}
