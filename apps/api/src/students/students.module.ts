import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentEntity, ApplicationEntity, DocumentEntity]),
    ApplicationsModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule { }
