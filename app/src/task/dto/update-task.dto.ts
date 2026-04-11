import { Type } from 'class-transformer';
import { IsDate, IsString, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @MinLength(3)
  title?: string;

  @IsString()
  @MinLength(3)
  description?: string;

  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
