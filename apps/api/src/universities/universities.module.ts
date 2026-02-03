import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversityEntity } from '../entities/university.entity';
import { UserEntity } from '../entities/user.entity';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UniversityEntity, UserEntity])],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
