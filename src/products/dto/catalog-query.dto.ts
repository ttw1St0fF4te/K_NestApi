import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum SortBy {
  PRICE = 'price',
  DATE = 'date',
  NAME = 'name'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class CatalogQueryDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
