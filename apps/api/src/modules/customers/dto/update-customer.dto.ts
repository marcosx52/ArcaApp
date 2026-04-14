import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  documentType?: 'CUIT' | 'CUIL' | 'DNI' | 'SIN_DOCUMENTO';

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  taxCondition?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isFrequent?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
