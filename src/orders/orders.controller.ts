import { Controller, Get, Post, Body, Param, UseGuards, Session, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { CheckoutResponseDto } from './dto/checkout-response.dto';

@Controller('orders')
@UseGuards(AuthenticatedGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('checkout')
  async getCheckoutInfo(@Session() session: Record<string, any>): Promise<CheckoutResponseDto> {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    return this.ordersService.getCheckoutInfo(session.passport.user.id);
  }

  @Post()
  async createOrder(
    @Session() session: Record<string, any>,
    @Body() createOrderDto: CreateOrderDto
  ) {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    const order = await this.ordersService.createOrder(
      session.passport.user.id,
      createOrderDto
    );

    return {
      success: true,
      orderId: order.id,
      message: 'Заказ успешно оформлен! Спасибо за покупку!'
    };
  }

  @Get(':id')
  async getOrderConfirmation(
    @Session() session: Record<string, any>,
    @Param('id') id: string
  ) {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    return this.ordersService.findOne(+id, session.passport.user.id);
  }

  @Get()
  async getUserOrders(@Session() session: Record<string, any>) {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    const orders = await this.ordersService.findUserOrders(session.passport.user.id);
    return {
      success: true,
      orders
    };
  }

  @Get(':id/details')
  async getOrderWithItems(
    @Session() session: Record<string, any>,
    @Param('id') id: string
  ) {
    if (!session.passport?.user?.id) {
      throw new NotFoundException('Пользователь не найден в сессии');
    }

    const orderDetails = await this.ordersService.getOrderWithItems(
      +id, 
      session.passport.user.id
    );
    
    return {
      success: true,
      order: orderDetails
    };
  }
}
