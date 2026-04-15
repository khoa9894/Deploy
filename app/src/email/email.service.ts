import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(data: { to: string; subject: string; message: string }) {
    // Validate email format
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

      this.logger.log(`Email sent successfully to ${data.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${data.to}: ${error.message}`,
        error.stack,
      );
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

      this.logger.log(`Email (template) sent successfully to ${data.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${data.to}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }
}
