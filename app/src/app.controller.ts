import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Check health of the application
  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }
}
