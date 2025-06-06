import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
    // Проверяем существование пользователя
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем существование продукта
    const product = await this.productsRepository.findOne({
      where: { id: createReviewDto.productId }
    });

    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на этот продукт
    const existingReview = await this.reviewsRepository.findOne({
      where: { 
        userId: userId,
        productId: createReviewDto.productId 
      }
    });

    if (existingReview) {
      throw new BadRequestException('Вы уже оставили отзыв на этот продукт');
    }

    // Создаем новый отзыв
    const review = this.reviewsRepository.create({
      text: createReviewDto.text,
      rating: createReviewDto.rating,
      productId: createReviewDto.productId,
      userId: userId,
      date: new Date()
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Возвращаем созданный отзыв с информацией о пользователе
    return {
      id: savedReview.id,
      text: savedReview.text,
      rating: savedReview.rating,
      date: savedReview.date,
      productId: savedReview.productId,
      userId: savedReview.userId,
      user: {
        id: user.id,
        username: user.username
      },
      product: {
        id: product.id,
        name: product.name
      }
    };
  }

  async findByProduct(productId: number): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsRepository.find({
      where: { productId },
      relations: ['user'],
      order: { date: 'DESC' }
    });

    return reviews.map(review => ({
      id: review.id,
      text: review.text,
      rating: review.rating,
      date: review.date,
      productId: review.productId,
      userId: review.userId,
      user: {
        id: review.user.id,
        username: review.user.username
      }
    }));
  }

  async findAll(): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewsRepository.find({
      relations: ['user', 'product'],
      order: { date: 'DESC' }
    });

    return reviews.map(review => ({
      id: review.id,
      text: review.text,
      rating: review.rating,
      date: review.date,
      productId: review.productId,
      userId: review.userId,
      user: {
        id: review.user.id,
        username: review.user.username
      },
      product: {
        id: review.product.id,
        name: review.product.name
      }
    }));
  }

  async findOne(id: number): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product']
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return {
      id: review.id,
      text: review.text,
      rating: review.rating,
      date: review.date,
      productId: review.productId,
      userId: review.userId,
      user: {
        id: review.user.id,
        username: review.user.username
      },
      product: {
        id: review.product.id,
        name: review.product.name
      }
    };
  }

  async update(id: number, userId: number, updateReviewDto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product']
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    // Проверяем, что пользователь может редактировать только свой отзыв
    if (review.userId !== userId) {
      throw new BadRequestException('Вы можете редактировать только свои отзывы');
    }

    // Обновляем отзыв
    if (updateReviewDto.text !== undefined) {
      review.text = updateReviewDto.text;
    }
    if (updateReviewDto.rating !== undefined) {
      review.rating = updateReviewDto.rating;
    }

    const savedReview = await this.reviewsRepository.save(review);

    return {
      id: savedReview.id,
      text: savedReview.text,
      rating: savedReview.rating,
      date: savedReview.date,
      productId: savedReview.productId,
      userId: savedReview.userId,
      user: {
        id: review.user.id,
        username: review.user.username
      },
      product: {
        id: review.product.id,
        name: review.product.name
      }
    };
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const review = await this.reviewsRepository.findOne({
      where: { id }
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    // Проверяем, что пользователь может удалять только свой отзыв
    if (review.userId !== userId) {
      throw new BadRequestException('Вы можете удалять только свои отзывы');
    }

    await this.reviewsRepository.remove(review);

    return { message: 'Отзыв успешно удален' };
  }
}
