import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoiceRelationsService } from './invoice-relations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('invoices/:invoiceId/relations')
export class InvoiceRelationsController {
  constructor(private readonly service: InvoiceRelationsService) {}

  @Get()
  list(@CurrentCompany() companyId: string, @Param('invoiceId') invoiceId: string) {
    return this.service.listByInvoice(invoiceId, companyId);
  }
}
