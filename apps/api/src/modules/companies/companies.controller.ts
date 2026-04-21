import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { AllowCompanyRouteParam } from '../../common/decorators/allow-company-route-param.decorator';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@AllowCompanyRouteParam('id')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user?.id ?? '');
  }

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @UseGuards(CompanyAccessGuard)
  @Get(':id')
  findOne(@CurrentCompany() companyId: string, @CurrentUser() user: { id: string }) {
    return this.service.findOne(companyId, user?.id ?? '');
  }

  @UseGuards(CompanyAccessGuard)
  @Patch(':id')
  update(
    @CurrentCompany() companyId: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.update(companyId, user?.id ?? '', dto);
  }

  @UseGuards(CompanyAccessGuard)
  @Get(':id/readiness')
  readiness(@CurrentCompany() companyId: string, @CurrentUser() user: { id: string }) {
    return this.service.readiness(companyId, user?.id ?? '');
  }
}
