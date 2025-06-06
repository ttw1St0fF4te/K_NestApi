import { ProductResponseDto } from './product-response.dto';
import { ReviewDto } from './review.dto';

export class ProductDetailsResponseDto extends ProductResponseDto {
  reviews: ReviewDto[];
}
