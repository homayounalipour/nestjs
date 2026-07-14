import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { Conversation } from '../entities/conversation.entity';
import { ConversationMember } from '../entities/conversation-member.entity';
import { Message } from '../entities/message.entity';
import Users from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationMember,
      Message,
      Users,
    ]),
    JwtModule.register({
      secret: 'secret',
    }),
  ],
  providers: [ChatGateway, ChatService, WsJwtGuard],
  exports: [ChatService],
})
export class ChatModule {}
