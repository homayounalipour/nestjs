import { HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Codes } from '../entities/codes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Codes)
    private readonly codeRepository: Repository<Codes>,
  ) {}
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findUserByEmail(registerDto.email);
    if (user) {
      throw new HttpException('User already exists', 400);
    }
    registerDto.password = await bcrypt.hash(registerDto.password, 10);
    return await this.usersService.createUser(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findUserByEmailWithPassword(
      loginDto.email,
    );
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    if (loginDto.code) {
      const checkCode = await this.codeRepository.findOne({
        where: {
          code: loginDto.code,
          email: loginDto.email,
          is_used:false
        },
      });
      if (checkCode) {
        await this.codeRepository.update(checkCode.id, { is_used: true });
        const accessToken = this.jwtService.sign({
          sub: user.id,
          email: user.email,
        });
        return {
          accessToken: accessToken,
        };
      } else {
        throw new HttpException('Code is not valid', 400);
      }
     
    } else {
      // generate 5 digit otp code
      const otp = await this.generateOtpCode();
      // save otp code to database
      await this.codeRepository.save({
        code: otp,
        email: loginDto.email,
      });
      return {
        code: otp,
      };
      // send otp code tp user
    }

    // const isPasswordMatch = await bcrypt.compare(
    //   loginDto.password,
    //   user.password,
    // );
    //
    // if (!isPasswordMatch) {
    //   throw new HttpException('wrong password', 400);
    // }
    // console.log(isPasswordMatch);
  }
  async generateOtpCode() {
    while (true) {
      const fiveDigitCode = this.getRandomCode();
      const checkCode = await this.codeRepository.findOne({
        where: {
          code: fiveDigitCode,
        },
      });
      if (!checkCode) {
        return fiveDigitCode;
      }
    }
  }
  getRandomCode() {
    const min = 10000;
    const max = 99999;
    const otp = Math.floor(Math.random() * (max - min + 1) + min);
    return otp;
  }
}
