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
    return this.favoritesService.toggle(userId, toggleFavoriteDto.productId);
  }

  // GET /favorites - получить избранное текущего пользователя (аналог Index)
  @Get()
  async getUserFavorites(
    @Req() req: Request
  ): Promise<FavoriteResponseDto[]> {
    const userId = (req.user as any)?.id; // Получаем userId из сессии
    if (!userId) {
      throw new Error('Пользователь не найден в сессии');
    }
    return this.favoritesService.findUserFavorites(userId);
  }

}
