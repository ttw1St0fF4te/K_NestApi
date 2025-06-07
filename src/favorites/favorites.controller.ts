import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { Request } from 'express';

@Controller('favorites')
@UseGuards(AuthenticatedGuard) // Требуем авторизацию для всех операций с избранным
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // POST /favorites/toggle - переключить товар в избранном
  @Post('toggle')
  async toggle(
    @Req() req: Request,
    @Body() toggleFavoriteDto: ToggleFavoriteDto
  ) {
    const userId = (req.user as any)?.id; // Получаем userId из сессии
    if (!userId) {
      throw new Error('Пользователь не найден в сессии');
    }
    const result = await this.favoritesService.toggle(userId, toggleFavoriteDto.productId);
    
    // Преобразуем результат в формат, ожидаемый Flutter
    return {
      message: result.message,
      isInFavorites: result.action === 'added'
    };
  }

  // GET /favorites - получить избранное текущего пользователя (аналог Index)
  @Get()
  async getUserFavorites(
    @Req() req: Request
  ) {
    const userId = (req.user as any)?.id; // Получаем userId из сессии
    if (!userId) {
      throw new Error('Пользователь не найден в сессии');
    }
    const favorites = await this.favoritesService.findUserFavorites(userId);
    
    // Преобразуем в формат, ожидаемый Flutter
    return favorites.map(favorite => ({
      id: favorite.id,
      product: {
        id: favorite.product.id,
        name: favorite.product.name,
        price: favorite.product.price,
        image: favorite.product.image,
        category: favorite.product.category
      }
    }));
  }

}
