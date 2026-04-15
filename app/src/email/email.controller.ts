import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a test email' })
  async sendTestEmail(
    @Body() data: { to: string; subject: string; message: string },
  ) {
    await this.emailService.sendEmail(data);
    return { success: true, message: 'Email sent successfully' };
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Send a templated email' })
  async sendTemplateEmail(
    @Body()
    data: {
      to: string;
      subject: string;
      template: string;
      context: Record<string, any>;
    },
  ) {
    await this.emailService.sendEmailWithTemplate(data);
    return { success: true, message: 'Templated email sent successfully' };
  }
}
