import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductDetailsResponseDto } from './dto/product-details-response.dto';
import { ProductDetailsWithCartDto } from './dto/product-details-with-cart.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { Request } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('catalog')
  async getCatalog(@Query() query: CatalogQueryDto): Promise<{
    products: ProductResponseDto[];
    hasResults: boolean;
    isSearching: boolean;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: string;
  }> {
    const products = await this.productsService.findAll(query);
    
    return {
      products,
      hasResults: products.length > 0,
      isSearching: !!query.searchTerm,
      searchTerm: query.searchTerm,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };
  }

  @Get()
  async findAll(@Query() query: CatalogQueryDto): Promise<ProductResponseDto[]> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(+id);
    
    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }
    
    return product;
  }

  @Get(':id/details')
  async getDetails(@Param('id') id: string): Promise<ProductDetailsResponseDto> {
    const product = await this.productsService.findOneWithDetails(+id);
    
    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }
    
    return product;
  }

  @Get(':id/details-with-cart')
  async getDetailsWithCart(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('inCart') inCart?: string
  ): Promise<ProductDetailsWithCartDto> {
    const userId = (req.user as any)?.id;
    const product = await this.productsService.findOneWithDetailsAndCart(+id, userId);
    
    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }

    // Если inCart передан в query параметрах, переопределяем значение
    if (inCart !== undefined) {
      product.inCart = inCart === 'true';
    }
    
    return product;
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
