import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import userGuard from '../users/dto/userGuards';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()



  @UseGuards(JwtAuthGuard)
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() request: Request & { user: userGuard },
  ) {
    createProductDto.user = request.user;
    return this.productsService.create(createProductDto);
  }


  @Get()
  // findAll(@I18n() i18n: I18nContext) {
  findAll() {
    // return {
    //   message: i18n.t('tr.hello'),
    // }

    // throw new HttpException(i18n.t('tr.item_not_found', { args: { item: 'Product' } }), 400);
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto, @Req() request: Request & { user: userGuard },) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: number,
    @Req() request: Request & { user: userGuard },
  ) {
    return this.productsService.remove(id, request.user);
  }
}
