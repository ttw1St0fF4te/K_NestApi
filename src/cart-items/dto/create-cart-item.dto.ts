import { IsInt, Min, Max } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  cartId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;
}
