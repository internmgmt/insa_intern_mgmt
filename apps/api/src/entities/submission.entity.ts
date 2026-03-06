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
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SubmissionType {
  WEEKLY_REPORT = 'WEEKLY_REPORT',
  PROJECT_FILE = 'PROJECT_FILE',
  CODE = 'CODE',
  TASK = 'TASK',
  DOCUMENT = 'DOCUMENT',
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
    nullable: true,
  })
  studentId: string | null;

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
    type: 'enum',
    enum: SubmissionType,
    default: SubmissionType.DOCUMENT,
  })
  type: SubmissionType;

  @Column({
    name: 'assigned_by',
    type: 'uuid',
    nullable: true,
  })
  assignedBy: string | null;

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

  @Column({
    name: 'score',
    type: 'int',
    nullable: true,
  })
  score: number | null;

  @Column({
    name: 'max_score',
    type: 'int',
    nullable: true,
    default: 100,
  })
  maxScore: number | null;

  @Column({
    name: 'feedback',
    type: 'text',
    nullable: true,
  })
  feedback: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  data: any | null;

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

  @ManyToOne(() => InternEntity, (intern) => intern.submissions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'intern_id' })
  intern?: InternEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_by' })
  assigner?: UserEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: UserEntity | null;
}
