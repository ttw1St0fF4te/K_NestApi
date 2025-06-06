import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async create(createOrderItemDto: CreateOrderItemDto): Promise<OrderItem> {
    // Проверяем существование заказа
    const order = await this.orderRepository.findOne({
      where: { id: createOrderItemDto.orderId }
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${createOrderItemDto.orderId} не найден`);
    }

    // Проверяем существование товара
    const product = await this.productRepository.findOne({
      where: { id: createOrderItemDto.productId }
    });

    if (!product) {
      throw new NotFoundException(`Товар с ID ${createOrderItemDto.productId} не найден`);
    }

    // Проверяем, что количество корректное
    if (createOrderItemDto.quantity <= 0) {
      throw new BadRequestException('Количество должно быть больше 0');
    }

    const orderItem = this.orderItemRepository.create({
      orderId: createOrderItemDto.orderId,
      productId: createOrderItemDto.productId,
      quantity: createOrderItemDto.quantity,
      priceAtOrder: createOrderItemDto.priceAtOrder.toString()
    });

    return await this.orderItemRepository.save(orderItem);
  }

  async findAll(): Promise<OrderItemResponseDto[]> {
    const orderItems = await this.orderItemRepository.find({
      relations: ['order', 'product']
    });

    return orderItems.map(item => this.mapToResponseDto(item));
  }

  async findByOrderId(orderId: number): Promise<OrderItemResponseDto[]> {
    const orderItems = await this.orderItemRepository.find({
      where: { orderId },
      relations: ['product']
    });

    return orderItems.map(item => this.mapToResponseDto(item));
  }

  async findOne(id: number): Promise<OrderItemResponseDto> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['order', 'product']
    });

    if (!orderItem) {
      throw new NotFoundException(`Элемент заказа с ID ${id} не найден`);
    }

    return this.mapToResponseDto(orderItem);
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto): Promise<OrderItemResponseDto> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { id },
      relations: ['order', 'product']
    });

    if (!orderItem) {
      throw new NotFoundException(`Элемент заказа с ID ${id} не найден`);
    }

    if (updateOrderItemDto.quantity !== undefined) {
      if (updateOrderItemDto.quantity <= 0) {
        throw new BadRequestException('Количество должно быть больше 0');
      }
      orderItem.quantity = updateOrderItemDto.quantity;
    }

    if (updateOrderItemDto.priceAtOrder !== undefined) {
      if (updateOrderItemDto.priceAtOrder < 0) {
        throw new BadRequestException('Цена не может быть отрицательной');
      }
      orderItem.priceAtOrder = updateOrderItemDto.priceAtOrder.toString();
    }

    const savedOrderItem = await this.orderItemRepository.save(orderItem);
    return this.mapToResponseDto(savedOrderItem);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Элемент заказа с ID ${id} не найден`);
    }
  }

  async getOrderTotal(orderId: number): Promise<number> {
    const orderItems = await this.findByOrderId(orderId);
    return orderItems.reduce((total, item) => {
      return total + item.total;
    }, 0);
  }

  private mapToResponseDto(orderItem: OrderItem): OrderItemResponseDto {
    const total = orderItem.quantity * parseFloat(orderItem.priceAtOrder);
    
    return {
      id: orderItem.id,
      orderId: orderItem.orderId,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      priceAtOrder: orderItem.priceAtOrder,
      total,
      product: orderItem.product ? {
        id: orderItem.product.id,
        name: orderItem.product.name,
        price: orderItem.product.price,
        category: orderItem.product.category,
        description: orderItem.product.description,
        image: orderItem.product.image
      } : undefined,
      order: orderItem.order ? {
        id: orderItem.order.id,
        orderDate: orderItem.order.orderDate.toISOString(), // Преобразуем в ISO строку
        customerName: orderItem.order.customerName || undefined,
        totalAmount: orderItem.order.totalAmount
      } : undefined
    };
  }
}
