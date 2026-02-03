import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GlobalModule } from '../global/global.module';

@Module({
  imports: [GlobalModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
