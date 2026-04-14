import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class QueryCustomersDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  @IsBooleanString()
  isFrequent?: string;
}
