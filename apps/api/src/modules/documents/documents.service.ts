import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateInvoicePdf(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId } });
    if (!invoice) {
      return {
        success: false,
        data: null,
        message: 'Comprobante no encontrado',
      };
    }

    const document = await this.prisma.generatedDocument.create({
      data: {
        companyId: invoice.companyId,
        invoiceId: invoice.id,
        documentType: 'PDF_INVOICE',
        storagePath: `/tmp/invoices/${invoice.id}.pdf`,
        mimeType: 'application/pdf',
        generationStatus: 'GENERATED',
        generatedAt: new Date(),
      },
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { pdfDocumentId: document.id },
    });

    return {
      success: true,
      data: {
        documentId: document.id,
        invoiceId,
        documentType: document.documentType,
        generationStatus: document.generationStatus,
        generatedAt: document.generatedAt,
      },
      message: 'PDF mock generado',
    };
  }

  findOne(companyId: string, id: string) {
    return this.prisma.generatedDocument.findFirst({ where: { id, companyId } });
  }
}
