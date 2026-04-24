import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { GlobalModule } from '../global/global.module';
import { NotificationEntity } from '../entities/notification.entity';
import { UserEntity } from '../entities/user.entity';
import { ApplicationEntity } from '../entities/application.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      NotificationEntity,
      UserEntity,
      ApplicationEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
