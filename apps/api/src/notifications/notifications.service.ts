import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../global/services/mail/mail.service';
import { NotificationEntity } from '../entities/notification.entity';
import { UserEntity } from '../entities/user.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly mailService: MailService,
  ) {}

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

  async listForUser(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit =
      options.limit && options.limit > 0 ? Math.min(options.limit, 50) : 10;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipientUserId = :userId', { userId });

    if (options.unreadOnly) {
      qb.andWhere('notification.isRead = false');
    }

    qb.orderBy('notification.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    const unreadCount = await this.notificationRepository.count({
      where: { recipientUserId: userId, isRead: false },
    });

    return {
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        items,
        unreadCount,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  async markRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientUserId: userId },
    });

    if (!notification) {
      return {
        success: true,
        message: 'Notification not found',
        data: null,
      };
    }

    notification.isRead = true;
    notification.readAt = notification.readAt ?? new Date();
    const saved = await this.notificationRepository.save(notification);

    return {
      success: true,
      message: 'Notification marked as read',
      data: saved,
    };
  }

  async markAllRead(userId: string) {
    await this.notificationRepository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true, readAt: () => 'NOW()' })
      .where('recipient_user_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();

    return {
      success: true,
      message: 'Notifications marked as read',
      data: null,
    };
  }

  async notifyApplicationCreated(applicationId: string) {
    return this.safeEvent('APPLICATION_CREATED', async () => {
      const application = await this.loadApplication(applicationId);
      if (!application) return;

      const admins = await this.getAdminRecipients();
      await this.createNotifications(admins, {
        type: 'APPLICATION_CREATED',
        title: 'New application created',
        body: `${application.university?.name ?? 'A university'} created an application for ${application.academicYear}.`,
        entityType: 'APPLICATION',
        entityId: application.id,
        metadata: {
          action: 'created',
          applicationId: application.id,
          universityId: application.universityId,
          academicYear: application.academicYear,
          status: application.status,
        },
      });
    });
  }

  async notifyApplicationUpdated(applicationId: string) {
    return this.safeEvent('APPLICATION_UPDATED', async () => {
      const application = await this.loadApplication(applicationId);
      if (!application) return;

      const admins = await this.getAdminRecipients();
      await this.createNotifications(admins, {
        type: 'APPLICATION_UPDATED',
        title: 'Application updated',
        body: `Application ${application.name || application.id} was updated for ${application.academicYear}.`,
        entityType: 'APPLICATION',
        entityId: application.id,
        metadata: {
          action: 'updated',
          applicationId: application.id,
          universityId: application.universityId,
          academicYear: application.academicYear,
          status: application.status,
        },
      });
    });
  }

  async notifyApplicationSubmitted(applicationId: string) {
    return this.safeEvent('APPLICATION_SUBMITTED', async () => {
      const application = await this.loadApplication(applicationId);
      if (!application) return;

      const admins = await this.getAdminRecipients();
      await this.createNotifications(admins, {
        type: 'APPLICATION_SUBMITTED',
        title: 'Application submitted for review',
        body: `Application ${application.name || application.id} has been submitted for review.`,
        entityType: 'APPLICATION',
        entityId: application.id,
        metadata: {
          action: 'submitted',
          applicationId: application.id,
          universityId: application.universityId,
          academicYear: application.academicYear,
          status: ApplicationStatus.UNDER_REVIEW,
        },
      });
    });
  }

  async notifyApplicationArchived(applicationId: string) {
    return this.safeEvent('APPLICATION_ARCHIVED', async () => {
      const application = await this.loadApplication(applicationId);
      if (!application) return;

      const admins = await this.getAdminRecipients();
      await this.createNotifications(admins, {
        type: 'APPLICATION_ARCHIVED',
        title: 'Application archived',
        body: `Application ${application.name || application.id} was archived.`,
        entityType: 'APPLICATION',
        entityId: application.id,
        metadata: {
          action: 'archived',
          applicationId: application.id,
          universityId: application.universityId,
          academicYear: application.academicYear,
          status: ApplicationStatus.ARCHIVED,
        },
      });
    });
  }

  async notifyApplicationReviewed(
    applicationId: string,
    reviewerId: string,
    decision: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
  ) {
    return this.safeEvent('APPLICATION_REVIEWED', async () => {
      const application = await this.loadApplication(applicationId);
      if (!application) return;

      const universityUsers = await this.getUniversityRecipients(
        application.universityId,
      );
      const emailTargets = new Map<
        string,
        { email: string; firstName?: string; lastName?: string }
      >();
      for (const user of universityUsers) {
        if (user.email) {
          emailTargets.set(user.email, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      }
      if (application.university?.contactEmail) {
        emailTargets.set(application.university.contactEmail, {
          email: application.university.contactEmail,
        });
      }

      const title =
        decision === 'APPROVE'
          ? 'Application approved'
          : 'Application rejected';
      const body =
        decision === 'APPROVE'
          ? `Your application ${application.name || application.id} for ${application.academicYear} was approved.`
          : `Your application ${application.name || application.id} for ${application.academicYear} was rejected${rejectionReason ? `: ${rejectionReason}` : '.'}`;

      await this.createNotifications(universityUsers, {
        type:
          decision === 'APPROVE'
            ? 'APPLICATION_APPROVED'
            : 'APPLICATION_REJECTED',
        title,
        body,
        entityType: 'APPLICATION',
        entityId: application.id,
        metadata: {
          action: decision === 'APPROVE' ? 'approved' : 'rejected',
          applicationId: application.id,
          universityId: application.universityId,
          academicYear: application.academicYear,
          reviewerId,
          rejectionReason: rejectionReason || null,
        },
        sendEmail: true,
        emailTargets: Array.from(emailTargets.values()),
      });
    });
  }

  private async safeEvent<T>(label: string, action: () => Promise<T>) {
    try {
      return await action();
    } catch (error) {
      this.logger.error(
        `Failed to process notification event ${label}`,
        error as any,
      );
      return null;
    }
  }

  private async loadApplication(applicationId: string) {
    return this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['university'],
    });
  }

  private async getAdminRecipients() {
    return this.userRepository.find({
      where: { role: UserRole.ADMIN, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  private async getUniversityRecipients(universityId: string) {
    return this.userRepository.find({
      where: { role: UserRole.UNIVERSITY, universityId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  private async createNotifications(
    recipients: UserEntity[],
    payload: {
      type: string;
      title: string;
      body: string;
      entityType?: string | null;
      entityId?: string | null;
      metadata?: Record<string, unknown> | null;
      sendEmail?: boolean;
      emailTargets?: Array<{
        email: string;
        firstName?: string;
        lastName?: string;
      }>;
    },
  ) {
    if (!recipients.length) {
      if (payload.sendEmail && payload.emailTargets?.length) {
        await this.sendEmails(
          payload.emailTargets,
          payload.title,
          payload.body,
        );
      }
      return;
    }

    const records = recipients.map((recipient) =>
      this.notificationRepository.create({
        recipientUserId: recipient.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        entityType: payload.entityType ?? null,
        entityId: payload.entityId ?? null,
        metadata: payload.metadata ?? null,
        isRead: false,
        readAt: null,
      }),
    );

    await this.notificationRepository.save(records);

    if (payload.sendEmail) {
      await this.sendEmails(
        payload.emailTargets?.length
          ? payload.emailTargets
          : recipients
              .filter((recipient) => !!recipient.email)
              .map((recipient) => ({
                email: recipient.email,
                firstName: recipient.firstName,
                lastName: recipient.lastName,
              })),
        payload.title,
        payload.body,
      );
    }
  }

  private async sendEmails(
    recipients: Array<{ email: string; firstName?: string; lastName?: string }>,
    subject: string,
    body: string,
  ) {
    const uniqueRecipients = Array.from(
      new Map(
        recipients.map((recipient) => [recipient.email, recipient]),
      ).values(),
    );

    await Promise.allSettled(
      uniqueRecipients.map(async (recipient) => {
        try {
          await this.mailService.send({
            from: this.mailService.from(),
            to: recipient.email,
            subject: `INSA Notification: ${subject}`,
            html: `
              <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #0f172a;">${subject}</h2>
                <p style="margin: 0 0 16px 0;">Hello${recipient.firstName ? ` ${recipient.firstName}` : ''},</p>
                <p style="margin: 0 0 24px 0;">${body}</p>
                <p style="margin: 0; color: #64748b; font-size: 12px;">This message was generated automatically by the INSA Intern Management System.</p>
              </div>
            `,
            text: [
              `INSA Notification: ${subject}`,
              '',
              `Hello${recipient.firstName ? ` ${recipient.firstName}` : ''},`,
              '',
              body,
              '',
              'This message was generated automatically by the INSA Intern Management System.',
            ].join('\n'),
          });
        } catch (error) {
          this.logger.warn(
            `Failed to send notification email to ${recipient.email}`,
            error as any,
          );
        }
      }),
    );
  }
}
