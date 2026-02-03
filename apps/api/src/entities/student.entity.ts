import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApplicationEntity } from './application.entity';

export enum StudentStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  AWAITING_ARRIVAL = 'AWAITING_ARRIVAL',
  ARRIVED = 'ARRIVED',
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
}

@Entity({
  name: 'students',
})
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Column({
    name: 'student_id',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  studentId: string;

  @Column({
    name: 'field_of_study',
    type: 'varchar',
    length: 200,
  })
  fieldOfStudy: string;

  @Column({
    name: 'academic_year',
    type: 'varchar',
    length: 20,
  })
  academicYear: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.PENDING_REVIEW,
  })
  status: StudentStatus;

  @Column({
    name: 'rejection_reason',
    type: 'varchar',
    length: '500',
    nullable: true,
  })
  rejectionReason: string | null;

  @Column({
    name: 'cv_url',
    type: 'varchar',
    length: '500',
    nullable: true,
  })
  cvUrl: string | null;

  @Column({
    name: 'transcript_url',
    type: 'varchar',
    length: '500',
    nullable: true,
  })
  transcriptUrl: string | null;

  @Column({
    name: 'application_id',
    type: 'uuid',
  })
  applicationId: string;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
  })
  deletedAt: Date;

  @ManyToOne(() => ApplicationEntity, (application) => application.students, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'application_id' })
  application: ApplicationEntity;
}
