import { Injectable } from '@nestjs/common';
import Users from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  findUserByEmail = async (email: string) => {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  };

  findUserByEmailWithPassword = async (email: string) => {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  };

  findAll = async () => {
    return await this.userRepository.find();
  };
  createUser = async (data: CreateUserDto) => {
    const user = this.userRepository.create(data);
    await this.userRepository.save(user);
    return user;
  };

  findUserById(id: number) {
    return {
      id,
      name: 'homayoun',
      username: 'homayounalipour',
    };
  }
  findUserByUsername(username: string) {
    return {
      id: 1,
      name: 'homayoun',
      username,
    };
  }
}
