import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password!: string;
}
