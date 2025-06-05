import { CartItem } from '../../cart-items/entities/cart-item.entity';

export class CartResponseDto {
  id: number;
  userId: number;
  cartItems: CartItem[];
  totalAmount: number;
}
