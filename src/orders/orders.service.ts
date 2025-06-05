import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { CartsService } from '../carts/carts.service';
import { EmailService } from '../email/email.service';
import { OrderItemsService } from '../order-items/order-items.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private cartsService: CartsService,
    private emailService: EmailService,
    private orderItemsService: OrderItemsService,
  ) {}

  async getCheckoutInfo(userId: number): Promise<CheckoutResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product']
    });

    if (!cart || !cart.cartItems.length) {
      throw new BadRequestException('Корзина пуста');
    }

    const totalAmount = await this.cartsService.calculateTotal(cart);
    const totalSpent = user.totalSpent ?? 0;
    const loyaltyLevel = this.getLoyaltyLevel(totalSpent);
    const canUseWallet = !!loyaltyLevel;
    const walletBalance = user.walletBalance ?? 0;
    const potentialEarnings = canUseWallet ? totalAmount * this.getCashbackPercent(loyaltyLevel) : 0;

    return {
      cart,
      totalAmount,
      userEmail: user.email ?? '',
      loyaltyLevel,
      walletBalance,
      canUseWallet,
      potentialEarnings,
      finalAmount: totalAmount
    };
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRole']
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product']
    });

    if (!cart || !cart.cartItems.length) {
      throw new BadRequestException('Корзина пуста');
    }

    if (!user.email) {
      throw new BadRequestException('Для оформления заказа необходимо указать адрес электронной почты в профиле');
    }

    const totalAmount = await this.cartsService.calculateTotal(cart);
    let walletUsed = 0;
    let walletEarned = 0;
    let finalAmount = totalAmount;

    // Обработка виртуального кошелька
    const totalSpent = user.totalSpent ?? 0;
    const loyaltyLevel = this.getLoyaltyLevel(totalSpent);
    if (loyaltyLevel) {
      if (createOrderDto.useWallet) {
        walletUsed = Math.min(user.walletBalance ?? 0, totalAmount);
        finalAmount = totalAmount - walletUsed;
        user.walletBalance = user.walletBalance ? user.walletBalance - walletUsed : 0;
      } else {
        const cashbackPercent = this.getCashbackPercent(loyaltyLevel);
        walletEarned = totalAmount * cashbackPercent;
        user.walletBalance = (user.walletBalance ?? 0) + walletEarned;
      }
    }

    // Создание заказа
    const order = this.orderRepository.create({
      userId,
      orderDate: new Date(),
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      deliveryAddress: `${createOrderDto.country}, ${createOrderDto.city}, ${createOrderDto.postalCode}, ${createOrderDto.street}, ${createOrderDto.houseNumber}`,
      totalAmount: totalAmount.toString(),
      walletUsed: walletUsed ? walletUsed.toString() : null,
      walletEarned: walletEarned ? walletEarned.toString() : null,
      finalAmount: finalAmount.toString()
    });

    await this.orderRepository.save(order);

    // Создание элементов заказа
    for (const cartItem of cart.cartItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: order.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtOrder: cartItem.product.price
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Обновление данных пользователя
    user.totalSpent = (user.totalSpent ?? 0) + finalAmount;
    user.loyaltyLevel = this.getLoyaltyLevel(user.totalSpent ?? 0);
    await this.userRepository.save(user);

    // Удаление корзины
    await this.cartRepository.remove(cart);

    // Отправка email с подтверждением
    try {
      await this.emailService.sendOrderConfirmation(user.email, order);
    } catch (error) {
      console.error('Ошибка отправки email:', error);
    }

    return order;
  }

  async findOne(id: number, userId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId },
      relations: ['orderItems', 'orderItems.product', 'user']
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    return order;
  }

  async findUserOrders(userId: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['orderItems', 'orderItems.product'],
      order: { orderDate: 'DESC' }
    });
  }

  async getOrderWithItems(orderId: number, userId: number) {
    const order = await this.findOne(orderId, userId);
    const orderItems = await this.orderItemsService.findByOrderId(orderId);
    
    return {
      ...order,
      orderItems
    };
  }

  private readonly loyaltyLevels = {
    Basic: 'Базовый',
    Silver: 'Серебряный',
    Gold: 'Золотой'
  };

  private readonly levels: Record<string, { minSpent: number; cashbackPercent: number }> = {
    'Базовый': { minSpent: 30000, cashbackPercent: 0.05 },
    'Серебряный': { minSpent: 60000, cashbackPercent: 0.10 },
    'Золотой': { minSpent: 120000, cashbackPercent: 0.15 }
  };

  private getLoyaltyLevel(totalSpent: number): string | null {
    if (totalSpent >= this.levels[this.loyaltyLevels.Gold].minSpent) return this.loyaltyLevels.Gold;
    if (totalSpent >= this.levels[this.loyaltyLevels.Silver].minSpent) return this.loyaltyLevels.Silver;
    if (totalSpent >= this.levels[this.loyaltyLevels.Basic].minSpent) return this.loyaltyLevels.Basic;
    return null;
  }

  private getCashbackPercent(loyaltyLevel: string | null): number {
    if (loyaltyLevel && this.levels[loyaltyLevel]) {
      return this.levels[loyaltyLevel].cashbackPercent;
    }
    return 0;
  }
}
