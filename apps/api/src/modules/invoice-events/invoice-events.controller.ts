import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InvoiceEventsService } from './invoice-events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CompanyAccessGuard } from '../../common/guards/company-access.guard';
import { CurrentCompany } from '../../common/decorators/current-company.decorator';

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('invoices/:invoiceId/events')
export class InvoiceEventsController {
  constructor(private readonly service: InvoiceEventsService) {}

  @Get()
  findByInvoice(@CurrentCompany() companyId: string, @Param('invoiceId') invoiceId: string) {
    return this.service.findByInvoice(invoiceId, companyId);
  }
}
