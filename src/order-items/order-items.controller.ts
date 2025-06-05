import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Session, ParseIntPipe } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('order-items')
@UseGuards(AuthenticatedGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  async create(@Body() createOrderItemDto: CreateOrderItemDto) {
    const orderItem = await this.orderItemsService.create(createOrderItemDto);
    return {
      success: true,
      orderItem
    };
  }

  @Get()
  async findAll() {
    const orderItems = await this.orderItemsService.findAll();
    return {
      success: true,
      orderItems
    };
  }

  @Get('order/:orderId')
  async findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    const orderItems = await this.orderItemsService.findByOrderId(orderId);
    return {
      success: true,
      orderItems
    };
  }

  @Get('order/:orderId/total')
  async getOrderTotal(@Param('orderId', ParseIntPipe) orderId: number) {
    const total = await this.orderItemsService.getOrderTotal(orderId);
    return {
      success: true,
      total
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const orderItem = await this.orderItemsService.findOne(id);
    return {
      success: true,
      orderItem
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateOrderItemDto: UpdateOrderItemDto
  ) {
    const orderItem = await this.orderItemsService.update(id, updateOrderItemDto);
    return {
      success: true,
      orderItem
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.orderItemsService.remove(id);
    return {
      success: true,
      message: 'Элемент заказа успешно удален'
    };
  }
}
