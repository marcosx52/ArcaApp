import { IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  salesPointId?: string;

  @IsOptional()
  @IsString()
  conceptType?: 'PRODUCTS' | 'SERVICES' | 'PRODUCTS_AND_SERVICES';

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsOptional()
  @IsString()
  currencyRate?: string;

  @IsOptional()
  @IsString()
  issueDate?: string;
}
