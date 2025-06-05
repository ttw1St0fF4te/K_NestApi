import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAtOrder?: number;
}
