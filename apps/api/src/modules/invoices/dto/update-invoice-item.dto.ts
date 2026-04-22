import { IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceItemDto {
  @IsOptional()
  @IsString()
  productId?: string | null;

  @IsOptional()
  @IsString()
  itemCode?: string | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsOptional()
  @IsString()
  unitPrice?: string;

  @IsOptional()
  @IsString()
  discountAmount?: string;

  @IsOptional()
  @IsString()
  vatRate?: string;
}
