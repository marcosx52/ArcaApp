import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post('invoices/:invoiceId/generate-pdf')
  generatePdf(@CurrentCompany() companyId: string, @Param('invoiceId') invoiceId: string) {
    return this.service.generateInvoicePdf(companyId, invoiceId);
  }

  @Get('documents/:id')
  findOne(@CurrentCompany() companyId: string, @Param('id') id: string) {
    return this.service.findOne(companyId, id);
  }
}
