import { CartItem } from '../../cart-items/entities/cart-item.entity';

export class CheckoutResponseDto {
  cart: {
    id: number;
    userId: number;
    cartItems: CartItem[];
  };
  totalAmount: number;
  userEmail: string;
  loyaltyLevel: string | null;
  walletBalance: number;
  canUseWallet: boolean;
  potentialEarnings: number;
  finalAmount: number;
}
