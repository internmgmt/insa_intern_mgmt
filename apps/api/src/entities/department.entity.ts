import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum DepartmentType {
  NETWORKING = 'NETWORKING',
  CYBERSECURITY = 'CYBERSECURITY',
  SOFTWARE_DEVELOPMENT = 'SOFTWARE_DEVELOPMENT',
}

@Entity({
  name: 'departments',
})
export class DepartmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: DepartmentType,
  })
  type: DepartmentType;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  description: string;

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

  @OneToMany(() => UserEntity, (user) => user.department, {
    nullable: true,
  })
  supervisors: UserEntity[];
}
