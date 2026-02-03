import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEntity } from '../entities/submission.entity';
import { StudentEntity } from '../entities/student.entity';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionEntity, StudentEntity])],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
