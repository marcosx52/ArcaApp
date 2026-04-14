import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  customerType!: 'INDIVIDUAL' | 'COMPANY' | 'FINAL_CONSUMER_PROFILE';

  @IsString()
  legalName!: string;

  @IsString()
  documentType!: 'CUIT' | 'CUIL' | 'DNI' | 'SIN_DOCUMENTO';

  @IsString()
  documentNumber!: string;

  @IsString()
  taxCondition!: string;

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
}
