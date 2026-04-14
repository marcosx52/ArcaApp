import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpsertCompanyTaxConfigDto {
  @IsEnum(['TESTING', 'PRODUCTION'])
  environment!: 'TESTING' | 'PRODUCTION';

  @IsOptional()
  @IsString()
  arcaServiceType?: string;

  @IsOptional()
  @IsBoolean()
  productionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  homologationEnabled?: boolean;

  @IsOptional()
  @IsString()
  nextInvoiceFlowMode?: string;

  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @IsOptional()
  @IsString()
  defaultInvoiceTypeC?: string;

  @IsOptional()
  @IsString()
  defaultInvoiceTypeB?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
