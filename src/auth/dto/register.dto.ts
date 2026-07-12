import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  constructor(
    email: string,
    first_name: string,
    last_name: string,
    age: number,
    password: string,
  ) {
    this.email = email;
    this.first_name = first_name;
    this.last_name = last_name;
    this.age = age;
    this.password = password;
  }
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsNumber()
  age: number;

  @IsString()
  @MinLength(6)
  password: string;
}