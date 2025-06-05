import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto);
    return await this.cartRepository.save(cart);
  }

  async findByUserId(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      // Create a new cart for the user if one doesn't exist
      return await this.create({ userId });
    }

    return cart;
  }

  async findOne(id: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      throw new NotFoundException(`Корзина с ID ${id} не найдена`);
    }

    return cart;
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    await this.cartRepository.update(id, updateCartDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cartRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Корзина с ID ${id} не найдена`);
    }
  }

  async calculateTotal(cart: Cart): Promise<number> {
    return cart.cartItems.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.product.price));
    }, 0);
  }
}
