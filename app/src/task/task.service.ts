import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { RetrieveTaskDto } from './dto/retrieve-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user_id: string): Promise<RetrieveTaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });

    return tasks.map(this.toDto);
  }

  async create(user_id: string, dto: CreateTaskDto): Promise<RetrieveTaskDto> {
    const task = await this.prisma.task.create({
      data: {
        user_id,
        title: dto.title,
        description: dto.description,
        due_date: dto.due_date,
      },
    });

    return this.toDto(task);
  }

  async update(
    user_id: string,
    id: string,
    dto: UpdateTaskDto,
  ): Promise<RetrieveTaskDto> {
    await this.findOwnedOrFail(user_id, id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        due_date: dto.due_date,
      },
    });

    return this.toDto(task);
  }

  async remove(user_id: string, id: string): Promise<void> {
    await this.findOwnedOrFail(user_id, id);
    await this.prisma.task.delete({ where: { id } });
  }

  private toDto(task: Task): RetrieveTaskDto {
    return {
      id: task.id as RetrieveTaskDto['id'],
      title: task.title,
      description: task.description ?? '',
      due_date: task.due_date ?? new Date(0),
    };
  }

  private async findOwnedOrFail(user_id: string, id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (task.user_id !== user_id) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }
}
