import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';

export enum SortBy {
  PRICE = 'price',
  ID = 'id',
  NAME = 'name'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class CatalogQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.ID;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
