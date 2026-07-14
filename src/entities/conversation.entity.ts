import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationMember } from './conversation-member.entity';
import { Message } from './message.entity';

export type ConversationType = 'private' | 'group' | 'support';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  room!: string;

  @Column({ type: 'varchar', default: 'private' })
  type!: ConversationType;

  @Column({ nullable: true })
  name?: string;

  @OneToMany(() => ConversationMember, (member) => member.conversation)
  members!: ConversationMember[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;
}
