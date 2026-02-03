import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DbModule } from './db/db.module';
import { getConfig } from './services/app-config/configuration';
// Cache module disabled in containerized dev mode to avoid optional runtime adapter issues
// import { AppCacheModule } from './app-cache/app-cache.module';
import { LoggerModule } from './logger/logger.module';
import { AsyncStorageMiddleware } from './global/middleware/async-storage/async-storage.middleware';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { UniversitiesModule } from './universities/universities.module';
import { ApplicationsModule } from './applications/applications.module';
import { StudentsModule } from './students/students.module';
import { InternsModule } from './interns/interns.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({
      cache: true,
      load: [getConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DbModule,
    // AppCacheModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    UniversitiesModule,
    ApplicationsModule,
    StudentsModule,
    InternsModule,
    SubmissionsModule,
    DocumentsModule,
    NotificationsModule,
    DashboardModule,
    LoggerModule,
    HealthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncStorageMiddleware).forRoutes('{*splat}');
  }
}
