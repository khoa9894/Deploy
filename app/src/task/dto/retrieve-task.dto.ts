import { UUID } from 'crypto';

export class RetrieveTaskDto {
  id!: UUID;
  title!: string;
  description!: string;
  dueDate!: Date;
}
