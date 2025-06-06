import { IsInt, IsPositive } from 'class-validator';

export class ToggleFavoriteDto {
  @IsInt()
  @IsPositive()
  productId: number;
}
