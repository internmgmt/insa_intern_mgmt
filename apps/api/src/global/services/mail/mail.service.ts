import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { MailConfig } from 'src/services/app-config/configuration';
import Mail from 'nodemailer/lib/mailer';
import { coordinatorCredentialsTemplate } from 'src/universities/templates/coordinator-email.template';
import {
  forgotPasswordTemplate,
  resetPasswordConfirmationTemplate,
  userCreatedTemplate,
  studentRejectedTemplate,
} from 'src/templates';

type MailOptions = Mail.Options;

@Injectable()
export class MailService {
  private readonly fromValue: string;
  private transport: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const {
      from,
      transportOptions: {
        host,
        port,
        auth: { user, pass },
      },
    } = configService.get<MailConfig>('mail') as MailConfig;

    this.fromValue = from;
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    this.transport = createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
    });
  }

  public async send(options: MailOptions): Promise<string> {
    try {
      const result = await this.transport.sendMail(options);
      this.logger.debug(`Email sent to ${options.to}`);
      return result.response;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  public from(): string {
    return this.fromValue;
  }

  public async sendForgotPasswordEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<string> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    const { subject, html, text } = forgotPasswordTemplate({
      firstName,
      email,
      resetLink,
      expiresIn: '1 hour',
    });

    return this.send({
      from: this.from(),
      to: email,
      subject,
      html,
      text,
    });
  }

  public async sendPasswordResetConfirmation(
    email: string,
    firstName: string,
    changedAt?: Date,
  ): Promise<string> {
    const { subject, html, text } = resetPasswordConfirmationTemplate({
      firstName,
      email,
      changedAt,
    });

    return this.send({
      from: this.from(),
      to: email,
      subject,
      html,
      text,
    });
  }

  public async sendUserCreatedEmail(
    email: string,
    firstName: string,
    lastName: string,
    temporaryPassword: string,
    role: string,
  ): Promise<string> {
    const loginUrl = `${this.frontendUrl}/login`;

    const { subject, html, text } = userCreatedTemplate({
      firstName,
      lastName,
      email,
      temporaryPassword,
      loginUrl,
      role,
    });

    return this.send({
      from: this.from(),
      to: email,
      subject,
      html,
      text,
    });
  }

  public async sendStudentRejectionEmail(
    email: string,
    firstName: string,
    universityName: string,
    rejectionReason: string,
    supportEmail: string,
  ): Promise<string> {
    const { subject, html, text } = studentRejectedTemplate({
      firstName,
      universityName,
      rejectionReason,
      supportEmail,
    });

    return this.send({
      from: this.from(),
      to: email,
      subject,
      html,
      text,
    });
  }

  public async sendCoordinatorCredentials(payload: {
    firstName: string;
    lastName: string;
    email: string;
    temporaryPassword: string;
    loginUrl?: string;
  }): Promise<string> {
    const { subject, html, text } = coordinatorCredentialsTemplate({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      temporaryPassword: payload.temporaryPassword,
      loginUrl: payload.loginUrl || `${this.frontendUrl}/login`,
    });

    return this.send({
      from: this.from(),
      to: payload.email,
      subject,
      html,
      text,
    });
  }
}
