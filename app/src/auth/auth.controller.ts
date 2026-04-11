import { Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login() {
    // Implement your login logic here
  }

  @Post('register')
  register() {
    // Implement your registration logic here
  }

  @Get('profile')
  getProfile() {
    // Implement your profile retrieval logic here
  }
}
