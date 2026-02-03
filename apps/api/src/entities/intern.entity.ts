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
import { UserEntity } from './user.entity';
import { StudentEntity } from './student.entity';
import { DepartmentEntity } from './department.entity';
import { SubmissionEntity } from './submission.entity';

@Entity({
  name: 'interns',
})
export class InternEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId: string;

  @Column({
    name: 'student_id',
    type: 'uuid',
    nullable: true,
  })
  studentId: string;

  @Column({
    name: 'intern_id',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  internId: string;

  @Column({
    name: 'assigned_supervisor_id',
    type: 'uuid',
    nullable: true,
  })
  assignedSupervisorId: string;

  @Column({
    name: 'department_id',
    type: 'uuid',
    nullable: true,
  })
  departmentId: string;

  @Column({
    name: 'start_date',
    type: 'timestamp',
    nullable: true,
  })
  startDate: Date | null;

  @Column({
    name: 'end_date',
    type: 'timestamp',
    nullable: true,
  })
  endDate: Date | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  status: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  skills?: string[];

  @Column({
    name: 'interview_notes',
    type: 'text',
    nullable: true,
  })
  interviewNotes?: string;

  @Column({
    name: 'final_evaluation',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  finalEvaluation?: number;

  @Column({
    name: 'certificate_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  certificateUrl?: string;

  @Column({
    name: 'certificate_issued',
    type: 'boolean',
    default: false,
  })
  certificateIssued?: boolean;

  @Column({
    name: 'completion_notes',
    type: 'text',
    nullable: true,
  })
  completionNotes?: string;

  @Column({
    name: 'termination_reason',
    type: 'text',
    nullable: true,
  })
  terminationReason?: string;

  @Column({
    name: 'is_suspended',
    type: 'boolean',
    default: false,
  })
  isSuspended: boolean;

  @Column({
    name: 'suspension_reason',
    type: 'text',
    nullable: true,
  })
  suspensionReason?: string | null;

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

  @ManyToOne(() => UserEntity, (user) => user.intern as any, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => StudentEntity, (student) => student.id as any, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'student_id' })
  student?: StudentEntity;

  @ManyToOne(() => UserEntity, (user) => user.supervisedInterns as any, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_supervisor_id' })
  supervisor?: UserEntity;

  @ManyToOne(
    () => DepartmentEntity,
    (department) => department.supervisors as any,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'department_id' })
  department?: DepartmentEntity;

  @OneToMany(() => SubmissionEntity, (submission) => submission.intern, {
    nullable: true,
  })
  submissions?: SubmissionEntity[];
}
