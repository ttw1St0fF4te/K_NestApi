import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartsModule } from '../carts/carts.module';
import { EmailModule } from '../email/email.module';
import { OrderItemsModule } from '../order-items/order-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Cart]),
    CartsModule,
    EmailModule,
    OrderItemsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
