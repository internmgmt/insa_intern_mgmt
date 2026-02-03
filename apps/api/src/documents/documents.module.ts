import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';

import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    TypeOrmModule.forFeature([
      DocumentEntity,
      StudentEntity,
      ApplicationEntity,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule { }
