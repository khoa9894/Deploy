import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { RetrieveTaskDto } from './dto/retrieve-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<RetrieveTaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map(this.toDto);
  }

  async create(userId: string, dto: CreateTaskDto): Promise<RetrieveTaskDto> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
      },
    });

    return this.toDto(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<RetrieveTaskDto> {
    await this.findOwnedOrFail(userId, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
      },
    });

    return this.toDto(task);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.findOwnedOrFail(userId, id);
    await this.prisma.task.delete({ where: { id } });
  }

  private toDto(task: Task): RetrieveTaskDto {
    return {
      id: task.id as RetrieveTaskDto['id'],
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ?? new Date(0),
    };
  }

  private async findOwnedOrFail(userId: string, id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }
}
