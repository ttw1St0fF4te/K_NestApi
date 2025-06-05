import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Session, NotFoundException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('carts')
@UseGuards(AuthenticatedGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('my-cart')
  async getMyCart(@Session() session: Record<string, any>): Promise<CartResponseDto> {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    const cart = await this.cartsService.findByUserId(session.passport.user.id);
    const totalAmount = await this.cartsService.calculateTotal(cart);

    return {
      ...cart,
      totalAmount
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CartResponseDto> {
    const cart = await this.cartsService.findOne(+id);
    const totalAmount = await this.cartsService.calculateTotal(cart);

    return {
      ...cart,
      totalAmount
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartsService.remove(+id);
  }
}
