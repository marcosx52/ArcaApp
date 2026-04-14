import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unitName?: string;

  @IsOptional()
  @IsString()
  referencePrice?: string;

  @IsOptional()
  @IsString()
  taxTreatment?: 'GRAVADO' | 'EXENTO' | 'NO_ALCANZADO';

  @IsOptional()
  @IsString()
  vatRate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
