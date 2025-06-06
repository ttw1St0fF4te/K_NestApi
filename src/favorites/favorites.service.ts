import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Переключение товара в избранном (добавить/удалить)
  async toggle(userId: number, productId: number): Promise<{ action: string; message: string }> {
    if (!userId) {
      throw new NotFoundException('ID пользователя не указан');
    }

    // Проверяем существование пользователя
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем существование товара
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    // Ищем существующую запись в избранном
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      }
    });

    if (existingFavorite) {
      // Удаляем из избранного
      await this.favoriteRepository.remove(existingFavorite);
      return {
        action: 'removed',
        message: 'Товар удален из избранного'
      };
    } else {
      // Добавляем в избранное
      const newFavorite = this.favoriteRepository.create({
        user,
        product
      });
      await this.favoriteRepository.save(newFavorite);
      return {
        action: 'added',
        message: 'Товар добавлен в избранное'
      };
    }
  }

  // Получить все избранные товары пользователя
  async findUserFavorites(userId: number): Promise<FavoriteResponseDto[]> {
    // Проверяем существование пользователя
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Получаем избранное пользователя с информацией о товарах
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'user']
    });

    return favorites.map(favorite => this.mapToResponseDto(favorite));
  }

  create(createFavoriteDto: CreateFavoriteDto) {
    return 'This action adds a new favorite';
  }

  findAll() {
    return `This action returns all favorites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }

  remove(id: number) {
    return `This action removes a #${id} favorite`;
  }

  private mapToResponseDto(favorite: Favorite): FavoriteResponseDto {
    return {
      id: favorite.id,
      userId: favorite.user.id,
      productId: favorite.product.id,
      product: {
        id: favorite.product.id,
        name: favorite.product.name,
        category: favorite.product.category,
        price: parseFloat(favorite.product.price),
        image: favorite.product.image,
        description: favorite.product.description
      }
    };
  }
}
