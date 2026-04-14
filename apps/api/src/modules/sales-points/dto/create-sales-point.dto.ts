import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSalesPointDto {
  @IsInt()
  @Min(1)
  posNumber!: number;

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
}
