import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ApplicationEntity } from './application.entity';

@Entity({
  name: 'universities',
})
export class UniversityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  address: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contactEmail: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  contactPhone: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

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

  @OneToMany(() => UserEntity, (user) => user.university, {
    nullable: true,
  })
  users: UserEntity[];

  @OneToMany(() => ApplicationEntity, (application) => application.university, {
    nullable: true,
  })
  applications: ApplicationEntity[];
}
