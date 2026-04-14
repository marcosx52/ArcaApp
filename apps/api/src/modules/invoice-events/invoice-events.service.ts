import { Injectable } from '@nestjs/common';
import { InvoiceEventType, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InvoiceEventsService {
  constructor(private readonly prisma: PrismaService) {}

  findByInvoice(invoiceId: string, companyId?: string) {
    return this.prisma.invoiceEvent.findMany({
      where: {
        invoiceId,
        ...(companyId ? { companyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: {
    invoiceId: string;
    companyId: string;
    actorUserId?: string;
    eventType: InvoiceEventType;
    previousStatus?: InvoiceStatus;
    newStatus?: InvoiceStatus;
    message?: string;
    payloadSnapshot?: Prisma.InputJsonValue;
  }) {
    const createData: Prisma.InvoiceEventUncheckedCreateInput = {
      invoiceId: data.invoiceId,
      companyId: data.companyId,
      actorUserId: data.actorUserId,
      eventType: data.eventType,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      message: data.message,
      payloadSnapshot: data.payloadSnapshot,
    };

    return this.prisma.invoiceEvent.create({
      data: createData,
    });
  }
}
