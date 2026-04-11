import { IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(8)
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  lastName!: string;
}
