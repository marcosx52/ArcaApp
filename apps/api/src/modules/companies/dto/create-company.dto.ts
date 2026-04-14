import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  legalName!: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsNotEmpty()
  cuit!: string;

  @IsNotEmpty()
  taxProfile!: string;

  @IsNotEmpty()
  vatCondition!: string;

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
  country?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
