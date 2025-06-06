import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { CartItem } from '../cart-items/entities/cart-item.entity';
import { Cart } from '../carts/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CartItem, Cart])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
