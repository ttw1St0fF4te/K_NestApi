import { ProductDetailsResponseDto } from './product-details-response.dto';

export class ProductDetailsWithCartDto extends ProductDetailsResponseDto {
  inCart: boolean;
}
