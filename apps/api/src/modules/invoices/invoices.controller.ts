import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { IssueInvoiceDto } from './dto/issue-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  findAll(@CurrentCompany() companyId: string, @Query() query: QueryInvoicesDto) {
    return this.service.findAll(companyId, query);
  }

  @Post()
  create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.service.create(companyId, user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.service.update(companyId, id, dto);
  }

  @Post(':id/items')
  addItem(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: CreateInvoiceItemDto) {
    return this.service.addItem(companyId, id, dto);
  }

  @Patch('items/:itemId')
  updateItem(@CurrentCompany() companyId: string, @Param('itemId') itemId: string, @Body() dto: UpdateInvoiceItemDto) {
    return this.service.updateItem(companyId, itemId, dto);
  }

  @Delete('items/:itemId')
  deleteItem(@CurrentCompany() companyId: string, @Param('itemId') itemId: string) {
    return this.service.deleteItem(companyId, itemId);
  }

  @Post(':id/validate')
  validate(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.validate(companyId, id);
  }

  @Post(':id/issue')
  issue(@CurrentCompany() companyId: string, @Param('id') id: string, @Body() dto: IssueInvoiceDto) {
    return this.service.issue(companyId, id, dto);
  }

  @Post(':id/create-credit-note-draft')
  createCreditNoteDraft(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.createCreditNoteDraft(companyId, id);
  }
}
