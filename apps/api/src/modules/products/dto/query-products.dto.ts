import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  itemType?: 'PRODUCT' | 'SERVICE';

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
