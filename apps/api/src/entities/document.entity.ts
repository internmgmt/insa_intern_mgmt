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

@Entity({
  name: 'documents',
})
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  url: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  metadata: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  tags: string | null;

  @Column({
    name: 'is_public',
    type: 'boolean',
    default: false,
  })
  isPublic: boolean;

  @Column({
    name: 'student_id',
    type: 'uuid',
    nullable: true,
  })
  studentId: string | null;

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
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'student_id' })
  student?: StudentEntity | null;
}
