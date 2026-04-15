import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, BadRequestException } from '@nestjs/common';
import { AppLogger } from '../common/logger';

@Injectable()
export class EmailService {
  private readonly logger = new AppLogger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(data: { to: string; subject: string; message: string }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
      throw new BadRequestException(`Invalid email address: ${data.to}`);
    }

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        text: data.message,
      });

      this.logger.log('Email sent', {
        to: data.to,
        subject: data.subject,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error, {
        to: data.to,
      });
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async sendEmailWithTemplate(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
      throw new BadRequestException(`Invalid email address: ${data.to}`);
    }

    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        template: data.template,
        context: data.context,
      });

      this.logger.log('Templated email sent', {
        to: data.to,
        template: data.template,
      });
    } catch (error) {
      this.logger.error('Failed to send templated email', error, {
        to: data.to,
      });
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }
}
