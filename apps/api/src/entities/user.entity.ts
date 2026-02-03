import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UniversityEntity } from './university.entity';
import { DepartmentEntity } from './department.entity';
import { InternEntity } from './intern.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  UNIVERSITY = 'UNIVERSITY',
  SUPERVISOR = 'SUPERVISOR',
  INTERN = 'INTERN',
}

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash: string;

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
    type: 'enum',
    enum: UserRole,
    default: UserRole.ADMIN,
  })
  role: UserRole;

  @Column({
    name: 'is_first_login',
    type: 'boolean',
    default: true,
  })
  isFirstLogin: boolean;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  token: string | null;

  @Column({
    name: 'reset_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resetToken: string | null;

  @Column({
    name: 'reset_token_expiry',
    type: 'timestamp',
    nullable: true,
  })
  resetTokenExpiry: Date | null;

  @Column({
    name: 'university_id',
    type: 'uuid',
    nullable: true,
  })
  universityId: string | null;

  @Column({
    name: 'department_id',
    type: 'uuid',
    nullable: true,
  })
  departmentId: string | null;

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

  @ManyToOne(() => UniversityEntity, (university) => university.users, {
    nullable: true,
  })
  @JoinColumn({ name: 'university_id' })
  university: UniversityEntity | null;

  @ManyToOne(() => DepartmentEntity, (department) => department.supervisors, {
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity | null;

  @OneToMany(() => InternEntity, (intern) => intern.supervisor, {
    nullable: true,
  })
  supervisedInterns?: InternEntity[];

  interns?: InternEntity[];

  intern?: InternEntity | null;
}
