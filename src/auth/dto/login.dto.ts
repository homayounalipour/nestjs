import { IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  constructor(
    email: string,
    code: number,
    // password: string,
  ) {
    this.email = email;
    this.code = code;
    // this.password = password;
  }
  @IsEmail()
  email: string;
  // @IsNotEmpty()
  // password: string;
  @IsOptional()
  code: number;
}
