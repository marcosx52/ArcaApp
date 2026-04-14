import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller()
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get('products')
  findAll(@CurrentCompany() companyId: string, @Query() query: QueryProductsDto) {
    return this.service.findAll(companyId, query);
  }

  @Get('products/search')
  search(@CurrentCompany() companyId: string, @Query() query: QueryProductsDto) {
    return this.service.findAll(companyId, query);
  }

  @Post('products')
  create(@CurrentCompany() companyId: string, @Body() dto: CreateProductDto) {
    return this.service.create(companyId, dto);
  }

  @Get('products/:id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch('products/:id')
  update(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(companyId, id, dto);
  }

  @Delete('products/:id')
  archive(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.archive(companyId, id);
  }
}
