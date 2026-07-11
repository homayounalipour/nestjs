import { IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
  // @IsNotEmpty()
  // password: string;
  @IsOptional()
  code: number;
}
