import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import Users from './user.entity';

@Entity('conversation_members')
@Unique(['conversationId', 'userId'])
export class ConversationMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conversationId!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Users;
}
