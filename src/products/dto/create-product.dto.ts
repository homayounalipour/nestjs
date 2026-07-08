import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import userGuard from '../../users/dto/userGuards';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description is too short' })
  readonly description: string;
  @IsNumber()
  @IsOptional()
  readonly price: string;
  @IsOptional()
  user: userGuard;
}
