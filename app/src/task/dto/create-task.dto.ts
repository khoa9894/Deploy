import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy groceries', minLength: 3 })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Milk, eggs, and bread', minLength: 3 })
  @IsString()
  @MinLength(3)
  description!: string;

  @ApiProperty({ example: '2026-04-20T10:00:00.000Z', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;
}
