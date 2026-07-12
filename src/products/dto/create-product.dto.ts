import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import userGuard from '../../users/dto/userGuards';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the product',
    minLength: 10,
    maxLength: 20,
    example: 'This is Product one',
    default: '',
  })
  readonly title!: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description is too short' })
  @ApiProperty({
    description: 'The title of the product',
    minLength: 20,
    maxLength: 1500,
    example: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
  })
  readonly description!: string;
  @IsNumber()
  @IsOptional()
  @ApiProperty(
    {
      description: 'The title of the product',
      minimum: 0,
      maximum: 1000000,
      example: 2500,
      default: 0,
    }
  )
  readonly price!: string;
  @ApiProperty(
    {
      description: 'The title of the user',
      type: 'array',
      example: [{
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      ],
    }
  )
  @IsOptional()
  user!: userGuard;
}
