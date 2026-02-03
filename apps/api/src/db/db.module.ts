import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from '../services/app-config/configuration';
import { UserEntity } from '../entities/user.entity';
import { UniversityEntity } from '../entities/university.entity';
import { DepartmentEntity } from '../entities/department.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { SubmissionEntity } from '../entities/submission.entity';
import { DocumentEntity } from '../entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const {
          database: { host, port, password, user, dbName },
        } = getConfig();

        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
          entities: [
            UserEntity,
            UniversityEntity,
            DepartmentEntity,
            ApplicationEntity,
            StudentEntity,
            InternEntity,
            SubmissionEntity,
            DocumentEntity,
          ],
          synchronize: false,
          retryAttempts: 10,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DbModule {}
