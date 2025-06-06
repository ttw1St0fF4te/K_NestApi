export class FavoriteResponseDto {
  id: number;
  userId: number;
  productId: number;
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
  };
}
