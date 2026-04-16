import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Decimal from 'decimal.js';
import { InvoiceEventType, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceEventsService } from '../invoice-events/invoice-events.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { IssueInvoiceDto } from './dto/issue-invoice.dto';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';

const MONEY_SCALE = 2;
const QUANTITY_SCALE = 3;
const RATE_SCALE = 2;
const HUNDRED = new Decimal(100);
const ZERO = new Decimal(0);

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

    const lastItem = await this.prisma.invoiceItem.findFirst({
      where: { invoiceId },
      orderBy: { lineOrder: 'desc' },
      select: { lineOrder: true },
    });
    const nextLineOrder = (lastItem?.lineOrder ?? 0) + 1;
    const amounts = this.calculateItemAmounts({
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      discountAmount: dto.discountAmount,
      vatRate: dto.vatRate,
    });

    const item = await this.prisma.invoiceItem.create({
      data: {
        invoiceId,
        productId: dto.productId,
        itemCode: dto.itemCode,
        description: dto.description,
        lineOrder: nextLineOrder,
        quantity: this.toPrismaDecimal(amounts.quantity, QUANTITY_SCALE),
        unitPrice: this.toPrismaDecimal(amounts.unitPrice, MONEY_SCALE),
        discountAmount: this.toPrismaDecimal(amounts.discountAmount, MONEY_SCALE),
        subtotalAmount: this.toPrismaDecimal(amounts.subtotalAmount, MONEY_SCALE),
        vatRate: this.toPrismaDecimal(amounts.vatRate, RATE_SCALE),
        vatAmount: this.toPrismaDecimal(amounts.vatAmount, MONEY_SCALE),
        totalAmount: this.toPrismaDecimal(amounts.totalAmount, MONEY_SCALE),
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

    const amounts = this.calculateItemAmounts({
      quantity: dto.quantity ?? item.quantity,
      unitPrice: dto.unitPrice ?? item.unitPrice,
      discountAmount: dto.discountAmount ?? item.discountAmount,
      vatRate: dto.vatRate ?? item.vatRate ?? ZERO,
    });

    const updated = await this.prisma.invoiceItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        quantity: this.toPrismaDecimal(amounts.quantity, QUANTITY_SCALE),
        unitPrice: this.toPrismaDecimal(amounts.unitPrice, MONEY_SCALE),
        discountAmount: this.toPrismaDecimal(amounts.discountAmount, MONEY_SCALE),
        subtotalAmount: this.toPrismaDecimal(amounts.subtotalAmount, MONEY_SCALE),
        vatRate: this.toPrismaDecimal(amounts.vatRate, RATE_SCALE),
        vatAmount: this.toPrismaDecimal(amounts.vatAmount, MONEY_SCALE),
        totalAmount: this.toPrismaDecimal(amounts.totalAmount, MONEY_SCALE),
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
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
      select: {
        subtotalAmount: true,
        vatAmount: true,
        totalAmount: true,
      },
    });

    const subtotal = items.reduce(
      (acc, item) => acc.plus(this.parseDecimal(item.subtotalAmount, 'subtotalAmount')),
      ZERO,
    );
    const tax = items.reduce((acc, item) => acc.plus(this.parseDecimal(item.vatAmount, 'vatAmount')), ZERO);
    const total = items.reduce(
      (acc, item) => acc.plus(this.parseDecimal(item.totalAmount, 'totalAmount')),
      ZERO,
    );

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotalAmount: this.toPrismaDecimal(subtotal, MONEY_SCALE),
        taxAmount: this.toPrismaDecimal(tax, MONEY_SCALE),
        totalAmount: this.toPrismaDecimal(total, MONEY_SCALE),
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

  private calculateItemAmounts(input: {
    quantity: Prisma.Decimal | Decimal.Value;
    unitPrice: Prisma.Decimal | Decimal.Value;
    discountAmount?: Prisma.Decimal | Decimal.Value | null;
    vatRate?: Prisma.Decimal | Decimal.Value | null;
  }) {
    const quantity = this.roundDecimal(this.parseDecimal(input.quantity, 'quantity'), QUANTITY_SCALE);
    const unitPrice = this.roundDecimal(this.parseDecimal(input.unitPrice, 'unitPrice'), MONEY_SCALE);
    const discountAmount = this.roundDecimal(
      this.parseDecimal(input.discountAmount ?? ZERO, 'discountAmount'),
      MONEY_SCALE,
    );
    const vatRate = this.roundDecimal(this.parseDecimal(input.vatRate ?? ZERO, 'vatRate'), RATE_SCALE);

    const subtotalAmount = this.roundDecimal(quantity.times(unitPrice).minus(discountAmount), MONEY_SCALE);
    const vatAmount = this.roundDecimal(subtotalAmount.times(vatRate).div(HUNDRED), MONEY_SCALE);
    const totalAmount = this.roundDecimal(subtotalAmount.plus(vatAmount), MONEY_SCALE);

    return {
      quantity,
      unitPrice,
      discountAmount,
      subtotalAmount,
      vatRate,
      vatAmount,
      totalAmount,
    };
  }

  private parseDecimal(value: Prisma.Decimal | Decimal.Value, fieldName: string) {
    try {
      if (value instanceof Decimal) {
        return value;
      }

      return new Decimal(value.toString());
    } catch {
      throw new BadRequestException(`Decimal inválido en ${fieldName}`);
    }
  }

  private roundDecimal(value: Decimal, scale: number) {
    return value.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);
  }

  private toPrismaDecimal(value: Decimal, scale: number) {
    const rounded = this.roundDecimal(value, scale);
    return new Prisma.Decimal(rounded.toFixed(scale));
  }
}
