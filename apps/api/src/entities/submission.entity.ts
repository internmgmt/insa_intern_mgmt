import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentEntity } from './student.entity';
import { InternEntity } from './intern.entity';
import { UserEntity } from './user.entity';

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({
  name: 'submissions',
})
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'student_id',
    type: 'uuid',
  })
  studentId: string;

  @Column({
    name: 'intern_id',
    type: 'uuid',
    nullable: true,
  })
  internId: string | null;

  @Column({
    type: 'varchar',
    length: 200,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  description: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  files: string | null;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.SUBMITTED,
  })
  status: SubmissionStatus;

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
    name: 'rejection_reason',
    type: 'varchar',
    length: '500',
    nullable: true,
  })
  rejectionReason: string | null;

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

  @ManyToOne(() => StudentEntity, (student) => student.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @ManyToOne(() => InternEntity, (intern) => intern.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'intern_id' })
  intern?: InternEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: UserEntity | null;
}
