export class ReviewDto {
  id: number;
  rating: number;
  comment: string;
  date: string;
  user: {
    id: number;
    username: string;
  };
}
