import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationMember } from '../entities/conversation-member.entity';
import { Message } from '../entities/message.entity';
import Users from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationMember)
    private readonly memberRepository: Repository<ConversationMember>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  getPrivateRoom(userA: number, userB: number): string {
    return `private:${[userA, userB].sort((a, b) => a - b).join(':')}`;
  }

  getGroupRoom(conversationId: number): string {
    return `group:${conversationId}`;
  }

  getSupportRoom(userId: number): string {
    return `support:${userId}`;
  }

  async getOrCreatePrivateConversation(userA: number, userB: number) {
    const room = this.getPrivateRoom(userA, userB);

    let conversation = await this.conversationRepository.findOne({
      where: { room },
    });

    if (!conversation) {
      conversation = await this.conversationRepository.save({
        room,
        type: 'private',
      });

      await this.memberRepository.save([
        { conversationId: conversation.id, userId: userA },
        { conversationId: conversation.id, userId: userB },
      ]);
    }

    return conversation;
  }

  async createGroupConversation(
    creatorId: number,
    name: string,
    memberIds: number[],
  ) {
    const uniqueMemberIds = [...new Set([creatorId, ...memberIds])];

    const conversation = await this.conversationRepository.save({
      room: `group:temp-${Date.now()}`,
      type: 'group',
      name,
    });

    conversation.room = this.getGroupRoom(conversation.id);
    await this.conversationRepository.save(conversation);

    await this.memberRepository.save(
      uniqueMemberIds.map((userId) => ({
        conversationId: conversation.id,
        userId,
      })),
    );

    return conversation;
  }

  async getOrCreateSupportConversation(userId: number) {
    const room = this.getSupportRoom(userId);

    let conversation = await this.conversationRepository.findOne({
      where: { room },
    });

    if (!conversation) {
      conversation = await this.conversationRepository.save({
        room,
        type: 'support',
      });

      await this.memberRepository.save({
        conversationId: conversation.id,
        userId,
      });
    }

    return conversation;
  }

  async ensureUserInConversation(userId: number, conversationId: number) {
    const member = await this.memberRepository.findOne({
      where: { userId, conversationId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this conversation');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async ensureCanAccessRoom(
    userId: number,
    role: 'user' | 'admin',
    room: string,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { room },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type === 'support' && role === 'admin') {
      return conversation;
    }

    const member = await this.memberRepository.findOne({
      where: { userId, conversationId: conversation.id },
    });

    if (!member) {
      throw new ForbiddenException('You cannot access this room');
    }

    return conversation;
  }

  async saveMessage(room: string, senderId: number, content: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { room },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.messageRepository.save({
      conversationId: conversation.id,
      senderId,
      content,
    });

    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });

    return {
      id: message.id,
      room,
      content: message.content,
      conversationId: conversation.id,
      type: conversation.type,
      createdAt: message.createdAt,
      sender: {
        id: sender?.id,
        email: sender?.email,
        first_name: sender?.first_name,
        last_name: sender?.last_name,
        avatar: sender?.avatar,
        role: sender?.role,
      },
    };
  }

  async getRoomMessages(room: string, limit = 50) {
    const conversation = await this.conversationRepository.findOne({
      where: { room },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
      take: limit,
      relations: {
        sender: true,
      },
    });

    return messages.map((message) => ({
      id: message.id,
      room,
      content: message.content,
      conversationId: conversation.id,
      type: conversation.type,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        email: message.sender.email,
        first_name: message.sender.first_name,
        last_name: message.sender.last_name,
        avatar: message.sender.avatar,
        role: message.sender.role,
      },
    }));
  }
}
