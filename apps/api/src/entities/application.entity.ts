import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UniversityEntity } from './university.entity';
import { StudentEntity } from './student.entity';
import { UserEntity } from './user.entity';

import { ApplicationStatus } from '../common/enums/application-status.enum';

@Entity({
  name: 'applications',
})
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'academic_year',
    type: 'varchar',
    length: 9,
  })
  academicYear: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  name?: string | null;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({
    name: 'official_letter_url',
    type: 'varchar',
    length: 500,
  })
  officialLetterUrl: string;

  @Column({
    name: 'rejection_reason',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({
    name: 'reviewed_by',
    type: 'uuid',
    nullable: true,
  })
  reviewedBy: string | null;

  @Column({
    name: 'reviewed_at',
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt: Date | null;

  @Column({
    name: 'university_id',
    type: 'uuid',
  })
  universityId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @ManyToOne(() => UniversityEntity, (university) => university.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: UserEntity | null;

  @OneToMany(() => StudentEntity, (student) => student.application, {
    cascade: true,
    nullable: true,
  })
  students: StudentEntity[];
}
