import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  async addToCart(userId: number, productId: number): Promise<CartItem> {
    // Find or create cart for user
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems']
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
    }

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException(`Товар с ID ${productId} не найден`);
    }

    // Check if item already in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId
      }
    });

    if (cartItem) {
      // Increment quantity if item exists
      cartItem.quantity += 1;
    } else {
      // Create new cart item if it doesn't exist
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity: 1
      });
    }

    return this.cartItemRepository.save(cartItem);
  }

  async findOne(id: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id },
      relations: ['product']
    });

    if (!cartItem) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    return cartItem;
  }

  async updateQuantity(id: number, quantity: number): Promise<CartItem> {
    const cartItem = await this.findOne(id);

    if (quantity <= 0) {
      throw new BadRequestException('Количество должно быть больше 0');
    }

    if (quantity > 10) {
      throw new BadRequestException('Максимальное количество для одного товара - 10');
    }

    cartItem.quantity = quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cartItemRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
  }

  async increaseQuantity(id: number): Promise<CartItem> {
    const cartItem = await this.findOne(id);

    if (cartItem.quantity >= 10) {
      throw new BadRequestException('Максимальное количество для одного товара - 10');
    }

    return this.updateQuantity(id, cartItem.quantity + 1);
  }

  async decreaseQuantity(id: number): Promise<CartItem> {
    const cartItem = await this.findOne(id);

    if (cartItem.quantity <= 1) {
      throw new BadRequestException('Минимальное количество для одного товара - 1. Используйте соответствующую кнопку, если хотите удалить товар.');
    }

    return this.updateQuantity(id, cartItem.quantity - 1);
  }
}
