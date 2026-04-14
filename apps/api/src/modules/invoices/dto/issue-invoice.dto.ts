import { IsOptional, IsBoolean } from 'class-validator';

export class IssueInvoiceDto {
  @IsOptional()
  @IsBoolean()
  forceRevalidation?: boolean;
}
