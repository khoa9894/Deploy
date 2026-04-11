import { UUID } from 'crypto';

export class UserInfoDto {
  id!: UUID;
  username!: string;
  firstName!: string;
  lastName!: string;
}
