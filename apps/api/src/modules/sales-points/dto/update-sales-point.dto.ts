import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

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
  @IsIn(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
