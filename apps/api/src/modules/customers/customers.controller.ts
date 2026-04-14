import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller()
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get('customers')
  findAll(@CurrentCompany() companyId: string, @Query() query: QueryCustomersDto) {
    return this.service.findAll(companyId, query);
  }

  @Get('customers/search')
  search(@CurrentCompany() companyId: string, @Query() query: QueryCustomersDto) {
    return this.service.findAll(companyId, query);
  }

  @Post('customers')
  create(@CurrentCompany() companyId: string, @Body() dto: CreateCustomerDto) {
    return this.service.create(companyId, dto);
  }

  @Get('customers/:id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch('customers/:id')
  update(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.service.update(companyId, id, dto);
  }

  @Delete('customers/:id')
  archive(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.archive(companyId, id);
  }
}
