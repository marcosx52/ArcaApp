import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SalesPointsService } from './sales-points.service';
import { CreateSalesPointDto } from './dto/create-sales-point.dto';
import { UpdateSalesPointDto } from './dto/update-sales-point.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { AllowCompanyRouteParam } from '../../common/decorators/allow-company-route-param.decorator';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class SalesPointsController {
  constructor(private readonly service: SalesPointsService) {}

  @AllowCompanyRouteParam()
  @UseGuards(CompanyAccessGuard)
  @Get('companies/:companyId/sales-points')
  list(@CurrentCompany() companyId: string) {
    return this.service.list(companyId);
  }

  @AllowCompanyRouteParam()
  @UseGuards(CompanyAccessGuard)
  @Post('companies/:companyId/sales-points')
  create(@CurrentCompany() companyId: string, @Body() dto: CreateSalesPointDto) {
    return this.service.create(companyId, dto);
  }

  @UseGuards(CompanyAccessGuard)
  @Patch('sales-points/:id')
  update(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: UpdateSalesPointDto) {
    return this.service.update(companyId, id, dto);
  }

  @UseGuards(CompanyAccessGuard)
  @Get('sales-points/:id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }
}
