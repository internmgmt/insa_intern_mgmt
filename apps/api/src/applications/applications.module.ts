import { Module } from '@nestjs/common';
import { DocumentEntity } from '../entities/document.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity, StudentEntity, DocumentEntity])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule { }
