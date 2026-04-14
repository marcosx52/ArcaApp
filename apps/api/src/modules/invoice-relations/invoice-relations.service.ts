import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceRelationsService {
  listByInvoice(invoiceId: string, companyId?: string) {
    return {
      success: true,
      data: [],
      message: `Relaciones del comprobante ${invoiceId}${companyId ? ` de la empresa ${companyId}` : ''}`,
    };
  }
}
