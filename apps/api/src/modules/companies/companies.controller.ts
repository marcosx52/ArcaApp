import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
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
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.findOne(id, user?.id ?? '');
  }

  @UseGuards(CompanyAccessGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.update(id, user?.id ?? '', dto);
  }

  @UseGuards(CompanyAccessGuard)
  @Get(':id/readiness')
  readiness(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.readiness(id, user?.id ?? '');
  }
}
