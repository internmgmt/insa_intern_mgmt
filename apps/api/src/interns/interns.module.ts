import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternsController } from './interns.controller';
import { InternsService } from './interns.service';
import { UserEntity } from '../entities/user.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { DepartmentEntity } from '../entities/department.entity';
import { SubmissionEntity } from '../entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternEntity,
      StudentEntity,
      UserEntity,
      DepartmentEntity,
      SubmissionEntity,
    ]),
  ],
  controllers: [InternsController],
  providers: [InternsService],
  exports: [InternsService],
})
export class InternsModule {}
