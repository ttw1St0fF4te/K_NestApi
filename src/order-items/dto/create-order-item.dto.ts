import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  orderId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  priceAtOrder: number;
}
