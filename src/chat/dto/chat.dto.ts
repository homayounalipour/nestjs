import { IsArray, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class JoinPrivateDto {
  @IsInt()
  targetUserId!: number;
}

export class JoinGroupDto {
  @IsInt()
  conversationId!: number;
}

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsInt({ each: true })
  memberIds!: number[];
}

export class AdminJoinSupportDto {
  @IsInt()
  userId!: number;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  room!: string;

  @IsString()
  @MinLength(1)
  content!: string;
}

export class GetMessagesDto {
  @IsString()
  @IsNotEmpty()
  room!: string;
}
