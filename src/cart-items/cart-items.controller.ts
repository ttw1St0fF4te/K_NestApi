import { Controller, Post, Param, Delete, UseGuards, Session, NotFoundException, Patch } from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('cart-items')
@UseGuards(AuthenticatedGuard)
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post('add/:productId')
  async addToCart(
    @Session() session: Record<string, any>,
    @Param('productId') productId: string
  ) {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    const cartItem = await this.cartItemsService.addToCart(
      session.passport.user.id,
      +productId
    );

    return {
      success: true,
      cartItem
    };
  }

  @Patch(':id/increase')
  async increaseQuantity(@Param('id') id: string) {
    const cartItem = await this.cartItemsService.increaseQuantity(+id);
    return {
      success: true,
      newQuantity: cartItem.quantity,
      itemTotal: cartItem.quantity * parseFloat(cartItem.product.price)
    };
  }

  @Patch(':id/decrease')
  async decreaseQuantity(@Param('id') id: string) {
    const cartItem = await this.cartItemsService.decreaseQuantity(+id);
    return {
      success: true,
      newQuantity: cartItem.quantity,
      itemTotal: cartItem.quantity * parseFloat(cartItem.product.price)
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cartItemsService.remove(+id);
    return {
      success: true
    };
  }
}
