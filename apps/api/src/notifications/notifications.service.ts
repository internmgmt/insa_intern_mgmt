import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../global/services/mail/mail.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly mailService: MailService) {}

  async sendMail(options: any) {
    try {
      const result = await this.mailService.send(options);
      return {
        success: true,
        message: 'Email sent successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to send email', error as any);
      return {
        success: false,
        message: 'Failed to send email',
        error: { details: (error as any)?.message ?? error },
      };
    }
  }

  queueMail(options: any) {
    setImmediate(async () => {
      try {
        await this.mailService.send(options);
        this.logger.log(`Queued email sent to ${options?.to ?? 'unknown'}`);
      } catch (err) {
        this.logger.error('Queued email failed', err as any);
      }
    });

    return {
      success: true,
      message: 'Email queued for delivery',
      data: null,
    };
  }

  async sendCoordinatorCredentials(payload: {
    firstName: string;
    lastName: string;
    email: string;
    temporaryPassword: string;
    loginUrl?: string;
  }) {
    try {
      const res = await this.mailService.sendCoordinatorCredentials(payload);
      return {
        success: true,
        message: 'Coordinator credentials email sent',
        data: res,
      };
    } catch (error) {
      this.logger.error('Failed to send coordinator credentials', error as any);
      return {
        success: false,
        message: 'Failed to send coordinator credentials',
        error: { details: (error as any)?.message ?? error },
      };
    }
  }
}
