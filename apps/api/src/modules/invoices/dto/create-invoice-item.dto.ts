import { IsOptional, IsString } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  itemCode?: string;

  @IsString()
  description!: string;

  @IsString()
  quantity!: string;

  @IsString()
  unitPrice!: string;

  @IsOptional()
  @IsString()
  discountAmount?: string;

  @IsOptional()
  @IsString()
  vatRate?: string;
}
