import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({
  name: 'notifications',
})
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'recipient_user_id',
    type: 'uuid',
  })
  recipientUserId: string;

  @Column({
    type: 'varchar',
    length: 80,
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  title: string;

  @Column({
    type: 'text',
  })
  body: string;

  @Column({
    name: 'entity_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  entityType: string | null;

  @Column({
    name: 'entity_id',
    type: 'uuid',
    nullable: true,
  })
  entityId: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata: Record<string, unknown> | null;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;

  @Column({
    name: 'read_at',
    type: 'timestamp',
    nullable: true,
  })
  readAt: Date | null;

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

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipient_user_id' })
  recipient: UserEntity;
}
