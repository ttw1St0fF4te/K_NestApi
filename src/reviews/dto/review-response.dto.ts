export class ReviewResponseDto {
  id: number;
  text: string;
  rating: number;
  date: Date;
  productId: number;
  userId: number;
  user?: {
    id: number;
    username: string;
  };
  product?: {
    id: number;
    name: string;
  };
}
