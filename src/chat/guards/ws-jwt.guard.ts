import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketUser } from '../types/socket-user.type';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    if (client.data.user) {
      return true;
    }

    const user = this.extractUser(client);
    if (!user) {
      throw new WsException('Unauthorized');
    }

    client.data.user = user;
    return true;
  }

  extractUser(client: Socket): SocketUser | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.toString().split(' ')[1];

    if (!token) {
      return null;
    }

    try {
      const payload = this.jwtService.verify<{
        sub: number;
        email: string;
        role?: 'user' | 'admin';
      }>(token);

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role ?? 'user',
      };
    } catch {
      return null;
    }
  }
}
