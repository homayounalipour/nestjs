import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/helpers/multer.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async findAll() {
    await this.usersService.findAll();
  }
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(@UploadedFile() file) {
    console.log(file);
    await this.usersService.uploadAvatar(file);
    return {
      message: 'Avatar uploaded successfully',
      data: file
    }
  }
}
