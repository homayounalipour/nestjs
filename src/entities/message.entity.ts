import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import Users from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conversationId!: number;

  @Column()
  senderId!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender!: Users;

  @CreateDateColumn()
  createdAt!: Date;
}
