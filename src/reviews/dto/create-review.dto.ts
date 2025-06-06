import { IsNotEmpty, IsNumber, IsString, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber({}, { message: 'ID продукта должно быть числом' })
  productId: number;

  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Рейтинг должен быть от 1 до 5' })
  @Max(5, { message: 'Рейтинг должен быть от 1 до 5' })
  rating: number;

  @IsString({ message: 'Текст отзыва должен быть строкой' })
  @IsNotEmpty({ message: 'Введите текст отзыва' })
  @MinLength(10, { message: 'Минимум 10 символов в отзыве' })
  text: string;
}
