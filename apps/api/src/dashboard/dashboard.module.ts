import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UserEntity } from '../entities/user.entity';
import { UniversityEntity } from '../entities/university.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { SubmissionEntity } from '../entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UniversityEntity,
      ApplicationEntity,
      StudentEntity,
      InternEntity,
      SubmissionEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
