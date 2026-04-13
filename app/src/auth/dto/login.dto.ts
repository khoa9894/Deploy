import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice@example.com', format: 'email' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password!: string;
}
