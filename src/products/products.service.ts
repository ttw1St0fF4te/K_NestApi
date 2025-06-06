import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CatalogQueryDto, SortBy, SortOrder } from './dto/catalog-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';
import { ReviewDto } from './dto/review.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll(query?: CatalogQueryDto): Promise<ProductResponseDto[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Поиск по названию (без учета регистра) - используем ILIKE для корректной работы с кириллицей
    if (query?.searchTerm) {
      queryBuilder.where('product.name ILIKE :searchTerm', {
        searchTerm: `%${query.searchTerm}%`
      });
    }

    // Сортировка
    const sortOrder = query?.sortOrder === SortOrder.DESC ? 'DESC' : 'ASC';
    
    if (query?.sortBy) {
      switch (query.sortBy) {
        case SortBy.PRICE:
          queryBuilder.orderBy('CAST(product.price AS DECIMAL)', sortOrder);
          break;
        case SortBy.DATE:
          queryBuilder.orderBy('product.id', sortOrder);
          break;
        case SortBy.NAME:
          queryBuilder.orderBy('product.name', sortOrder);
          break;
        default:
          queryBuilder.orderBy('product.id', 'ASC');
          break;
      }
    } else {
      queryBuilder.orderBy('product.id', 'ASC');
    }

    const products = await queryBuilder.getMany();

    return products.map(product => this.mapToResponseDto(product));
  }

  async findOne(id: number): Promise<ProductResponseDto | null> {
    const product = await this.productRepository.findOne({ 
      where: { id }
    });
    
    if (!product) {
      return null;
    }

    return this.mapToResponseDto(product);
  }

  async findOneWithDetails(id: number): Promise<ProductDetailsResponseDto | null> {
    const product = await this.productRepository.findOne({ 
      where: { id },
      relations: ['reviews', 'reviews.user']
    });
    
    if (!product) {
      return null;
    }

    return this.mapToDetailsResponseDto(product);
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price), // Преобразуем строку в число
      image: product.image,
      description: product.description
    };
  }

  private mapToDetailsResponseDto(product: Product): ProductDetailsResponseDto {
    const reviews: ReviewDto[] = product.reviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.text, // Используем text вместо comment
      date: review.date.toISOString(),
      user: {
        id: review.user.id,
        username: review.user.username
      }
    })) || [];

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      image: product.image,
      description: product.description,
      reviews
    };
  }
}
