import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(8)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password!: string;
}
