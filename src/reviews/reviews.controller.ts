import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthenticatedGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto): Promise<{ message: string; review: ReviewResponseDto }> {
    const review = await this.reviewsService.create(req.user.id, createReviewDto);
    return { 
      message: 'Отзыв успешно создан',
      review 
    };
  }

  @Get()
  async findAll(): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findAll();
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string): Promise<ReviewResponseDto[]> {
    return this.reviewsService.findByProduct(+productId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(+id);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto): Promise<{ message: string; review: ReviewResponseDto }> {
    const review = await this.reviewsService.update(+id, req.user.id, updateReviewDto);
    return {
      message: 'Отзыв успешно обновлен',
      review
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    return this.reviewsService.remove(+id, req.user.id);
  }
}
