import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UsersService } from '../users/users.service';
import { Product } from './entities/product.entity';
import userGuard from '../users/dto/userGuards';

@Injectable()
export class ProductsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price
        ? Number(createProductDto.price)
        : undefined,
      user: { id: createProductDto.user.id },
    });

    return await this.productRepository.save(product);
  }

 async findAll() {
    return await this.productRepository.find({
      relations: {
        user: true,
      },
    });
  }

 async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
    });
    if (!product) {
      throw new HttpException('Product not found',404);
    }
    return product;
  }

 async update(id: number, updateProductDto: UpdateProductDto) {
    const updateData: Partial<Product> = {};

    if (updateProductDto.title !== undefined) {
      updateData.title = updateProductDto.title;
    }
    if (updateProductDto.description !== undefined) {
      updateData.description = updateProductDto.description;
    }
    if (updateProductDto.price !== undefined) {
      updateData.price = Number(updateProductDto.price);
    }

    const result = await this.productRepository.update({ id }, updateData);

    if (result.affected === 0) {
      throw new HttpException('Product not found', 404);
    }

    return {};
  }

  async remove(id: number, user: userGuard) {
    const result = await this.productRepository.delete({
      id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      throw new HttpException('Product not found', 404);
    }

    return {};
  }
}
