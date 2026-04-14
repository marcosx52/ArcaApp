import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  summary(@CurrentCompany() companyId: string) {
    return this.service.summary(companyId);
  }
}
