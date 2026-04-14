import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSalesPointDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  arcaPosType?: string;

  @IsOptional()
  @IsBoolean()
  enabledForTesting?: boolean;

  @IsOptional()
  @IsBoolean()
  enabledForProduction?: boolean;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
