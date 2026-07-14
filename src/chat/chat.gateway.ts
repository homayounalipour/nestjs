import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import {
  AdminJoinSupportDto,
  CreateGroupDto,
  GetMessagesDto,
  JoinGroupDto,
  JoinPrivateDto,
  SendMessageDto,
} from './dto/chat.dto';
import { SocketUser } from './types/socket-user.type';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  handleConnection(client: Socket) {
    const user = this.wsJwtGuard.extractUser(client);

    if (!user) {
      client.disconnect();
      return;
    }

    client.data.user = user;
    client.join(`user:${user.id}`);

    if (user.role === 'admin') {
      client.join('admins');
    }
  }

  handleDisconnect(_client: Socket) {}

  private getUser(client: Socket): SocketUser {
    if (!client.data.user) {
      throw new WsException('Unauthorized');
    }

    return client.data.user;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinPrivate')
  async joinPrivate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinPrivateDto,
  ) {
    const user = this.getUser(client);

    if (user.id === data.targetUserId) {
      throw new WsException('Cannot chat with yourself');
    }

    const conversation = await this.chatService.getOrCreatePrivateConversation(
      user.id,
      data.targetUserId,
    );

    client.join(conversation.room);

    return {
      room: conversation.room,
      conversationId: conversation.id,
      messages: await this.chatService.getRoomMessages(conversation.room),
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('createGroup')
  async createGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateGroupDto,
  ) {
    const user = this.getUser(client);

    const conversation = await this.chatService.createGroupConversation(
      user.id,
      data.name,
      data.memberIds,
    );

    client.join(conversation.room);

    for (const memberId of data.memberIds) {
      this.server.to(`user:${memberId}`).emit('groupCreated', {
        room: conversation.room,
        conversationId: conversation.id,
        name: conversation.name,
      });
    }

    return {
      room: conversation.room,
      conversationId: conversation.id,
      name: conversation.name,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinGroup')
  async joinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGroupDto,
  ) {
    const user = this.getUser(client);
    const conversation = await this.chatService.ensureUserInConversation(
      user.id,
      data.conversationId,
    );

    client.join(conversation.room);

    return {
      room: conversation.room,
      conversationId: conversation.id,
      name: conversation.name,
      messages: await this.chatService.getRoomMessages(conversation.room),
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinSupport')
  async joinSupport(@ConnectedSocket() client: Socket) {
    const user = this.getUser(client);

    const conversation =
      await this.chatService.getOrCreateSupportConversation(user.id);

    client.join(conversation.room);
    this.server.to('admins').emit('supportRequested', {
      room: conversation.room,
      userId: user.id,
      email: user.email,
    });

    return {
      room: conversation.room,
      conversationId: conversation.id,
      messages: await this.chatService.getRoomMessages(conversation.room),
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('adminJoinSupport')
  async adminJoinSupport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: AdminJoinSupportDto,
  ) {
    const user = this.getUser(client);

    if (user.role !== 'admin') {
      throw new WsException('Only admins can join support rooms');
    }

    const conversation = await this.chatService.getOrCreateSupportConversation(
      data.userId,
    );

    client.join(conversation.room);

    return {
      room: conversation.room,
      conversationId: conversation.id,
      messages: await this.chatService.getRoomMessages(conversation.room),
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const user = this.getUser(client);

    await this.chatService.ensureCanAccessRoom(user.id, user.role, data.room);

    const message = await this.chatService.saveMessage(
      data.room,
      user.id,
      data.content,
    );

    this.server.to(data.room).emit('newMessage', message);

    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('getMessages')
  async getMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GetMessagesDto,
  ) {
    const user = this.getUser(client);

    await this.chatService.ensureCanAccessRoom(user.id, user.role, data.room);

    return this.chatService.getRoomMessages(data.room);
  }
}
