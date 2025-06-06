import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { OrdersModule } from './orders/orders.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import emailConfig from './config/email.config';

// Импортируем все entity
import { User } from './users/entities/user.entity';
import { UserRole } from './user-roles/entities/user-role.entity';
import { Cart } from './carts/entities/cart.entity';
import { CartItem } from './cart-items/entities/cart-item.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './order-items/entities/order-item.entity';
import { Product } from './products/entities/product.entity';
import { Review } from './reviews/entities/review.entity';
import { Favorite } from './favorites/entities/favorite.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          UserRole,
          Cart,
          CartItem,
          Order,
          OrderItem,
          Product,
          Review,
          Favorite
        ],
        autoLoadEntities: true,
        synchronize: false, // В продакшене должно быть false
        timezone: 'UTC', // Явно указываем UTC для PostgreSQL
        extra: {
          timezone: 'UTC', // Дополнительная настройка для PostgreSQL
        },
      }),
      inject: [ConfigService],
    }),
    ProductsModule, 
    ReviewsModule, 
    UsersModule, 
    UserRolesModule, 
    OrdersModule, 
    CartItemsModule, 
    CartsModule, 
    FavoritesModule, 
    OrderItemsModule,
    EmailModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
