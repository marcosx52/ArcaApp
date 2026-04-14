import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceEventType, InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceEventsService } from '../invoice-events/invoice-events.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { IssueInvoiceDto } from './dto/issue-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceEvents: InvoiceEventsService,
  ) {}

  findAll(companyId: string, query: QueryInvoicesDto) {
    return this.prisma.invoice.findMany({
      where: {
        companyId,
        ...(query.status ? { status: query.status as any } : {}),
        ...(query.customerId ? { customerId: query.customerId } : {}),
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(companyId: string, createdByUserId: string, dto: CreateInvoiceDto) {
    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        createdByUserId,
        invoiceKind: dto.invoiceKind,
        invoiceLetter: dto.invoiceLetter,
        customerId: dto.customerId,
        salesPointId: dto.salesPointId,
        conceptType: dto.conceptType,
        currencyCode: dto.currencyCode || 'PES',
        currencyRate: dto.currencyRate || '1',
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
      },
    });

    await this.invoiceEvents.create({
      invoiceId: invoice.id,
      companyId,
      actorUserId: createdByUserId,
      eventType: InvoiceEventType.DRAFT_CREATED,
      newStatus: InvoiceStatus.DRAFT,
      message: 'Borrador creado',
    });

    return invoice;
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { items: true, customer: true, events: true },
    });

    if (!invoice) throw new NotFoundException('Comprobante no encontrado');
    return invoice;
  }

  async update(companyId: string, id: string, dto: UpdateInvoiceDto) {
    await this.findOne(companyId, id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...dto,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
      },
    });
  }

  async addItem(companyId: string, invoiceId: string, dto: CreateInvoiceItemDto) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, companyId } });
    if (!invoice) throw new NotFoundException('Comprobante no encontrado');

    const lineOrder = await this.prisma.invoiceItem.count({ where: { invoiceId } });

    const quantity = Number(dto.quantity);
    const unitPrice = Number(dto.unitPrice);
    const discount = Number(dto.discountAmount || '0');
    const subtotal = quantity * unitPrice - discount;
    const vatRate = Number(dto.vatRate || '0');
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        productId: dto.productId,
        itemCode: dto.itemCode,
        description: dto.description,
        lineOrder: lineOrder + 1,
        quantity: String(quantity),
        unitPrice: String(unitPrice),
        discountAmount: String(discount),
        subtotalAmount: String(subtotal),
        vatRate: String(vatRate),
        vatAmount: String(vatAmount),
        totalAmount: String(total),
      },
    });

    await this.recalculateTotals(invoiceId);
    return item;
  }

  async updateItem(companyId: string, itemId: string, dto: UpdateInvoiceItemDto) {
    const item = await this.prisma.invoiceItem.findFirst({
      where: {
        id: itemId,
        invoice: { companyId },
      },
    });

    if (!item) throw new NotFoundException('Ítem no encontrado');

    const quantity = Number(dto.quantity ?? item.quantity.toString());
    const unitPrice = Number(dto.unitPrice ?? item.unitPrice.toString());
    const discount = Number(dto.discountAmount ?? item.discountAmount.toString());
    const subtotal = quantity * unitPrice - discount;
    const vatRate = Number(dto.vatRate ?? item.vatRate?.toString() ?? '0');
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const updated = await this.prisma.invoiceItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        quantity: String(quantity),
        unitPrice: String(unitPrice),
        discountAmount: String(discount),
        subtotalAmount: String(subtotal),
        vatRate: String(vatRate),
        vatAmount: String(vatAmount),
        totalAmount: String(total),
      },
    });

    await this.recalculateTotals(item.invoiceId);
    return updated;
  }

  async deleteItem(companyId: string, itemId: string) {
    const item = await this.prisma.invoiceItem.findFirst({
      where: {
        id: itemId,
        invoice: { companyId },
      },
    });

    if (!item) throw new NotFoundException('Ítem no encontrado');

    await this.prisma.invoiceItem.delete({ where: { id: itemId } });
    await this.recalculateTotals(item.invoiceId);

    return { success: true, message: 'Ítem eliminado' };
  }

  async validate(companyId: string, id: string) {
    const invoice = await this.findOne(companyId, id);

    const blockers = [];
    const warnings = [];

    if (!invoice.customerId) blockers.push({ code: 'missing_customer', message: 'Falta cliente' });
    if (!invoice.salesPointId) warnings.push({ code: 'missing_sales_point', message: 'Falta punto de venta' });
    if (!invoice.items.length) blockers.push({ code: 'missing_items', message: 'Faltan ítems' });

    return {
      invoiceId: id,
      canIssue: blockers.length === 0,
      blockers,
      warnings,
    };
  }

  async issue(companyId: string, id: string, _dto: IssueInvoiceDto) {
    const invoice = await this.findOne(companyId, id);

    const validation = await this.validate(companyId, id);
    if (!validation.canIssue) {
      return {
        invoiceId: id,
        status: 'FAILED',
        arcaStatus: 'REJECTED',
        message: 'No se puede emitir. Hay bloqueos funcionales.',
        blockers: validation.blockers,
      };
    }

    await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENDING',
      },
    });

    await this.invoiceEvents.create({
      invoiceId: id,
      companyId: invoice.companyId,
      actorUserId: invoice.createdByUserId,
      eventType: InvoiceEventType.EMISSION_REQUESTED,
      previousStatus: invoice.status,
      newStatus: 'SENDING' as any,
      message: 'Emisión solicitada (mock)',
    });

    return {
      invoiceId: id,
      status: 'SENDING',
      arcaStatus: 'UNKNOWN_NEEDS_CHECK',
      message: 'Flujo de emisión preparado. Integración ARCA real pendiente.',
    };
  }

  async recalculateTotals(invoiceId: string) {
    const items = await this.prisma.invoiceItem.findMany({ where: { invoiceId } });

    const subtotal = items.reduce((acc, item) => acc + Number(item.subtotalAmount), 0);
    const tax = items.reduce((acc, item) => acc + Number(item.vatAmount), 0);
    const total = items.reduce((acc, item) => acc + Number(item.totalAmount), 0);

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotalAmount: String(subtotal),
        taxAmount: String(tax),
        totalAmount: String(total),
        status: items.length ? 'READY' : 'DRAFT',
      },
    });
  }

  async createCreditNoteDraft(companyId: string, id: string) {
    const source = await this.findOne(companyId, id);

    const draft = await this.prisma.invoice.create({
      data: {
        companyId: source.companyId,
        createdByUserId: source.createdByUserId,
        customerId: source.customerId,
        salesPointId: source.salesPointId,
        invoiceKind: 'CREDIT_NOTE',
        invoiceLetter: source.invoiceLetter,
        conceptType: source.conceptType ?? undefined,
      },
    });

    return draft;
  }
}
