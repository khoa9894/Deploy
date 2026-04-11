import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { RetrieveTaskDto } from './dto/retrieve-task.dto';

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
