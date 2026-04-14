import { IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  invoiceKind!: 'INVOICE' | 'CREDIT_NOTE' | 'DEBIT_NOTE_FUTURE';

  @IsString()
  invoiceLetter!: 'A' | 'B' | 'C' | 'M' | 'E_FUTURE';

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
