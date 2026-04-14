import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CompanyTaxConfigService } from './company-tax-config.service';
import { UpsertCompanyTaxConfigDto } from './dto/upsert-company-tax-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/tax-config')
export class CompanyTaxConfigController {
  constructor(private readonly service: CompanyTaxConfigService) {}

  @Get()
  get(@CurrentCompany() companyId: string) {
    return this.service.get(companyId);
  }

  @Put()
  upsert(@CurrentCompany() companyId: string, @Body() dto: UpsertCompanyTaxConfigDto) {
    return this.service.upsert(companyId, dto);
  }

  @Get('readiness-check')
  readiness(@CurrentCompany() companyId: string) {
    return this.service.readiness(companyId);
  }
}
