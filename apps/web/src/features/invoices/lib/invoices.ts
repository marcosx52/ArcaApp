export type InvoiceStatus = 'DRAFT' | 'READY' | 'SENDING' | 'ISSUED' | 'FAILED' | 'CANCELLED_LOGICALLY';
export type ArcaInvoiceStatus = 'NOT_SENT' | 'ACCEPTED' | 'REJECTED' | 'PARTIAL_WARNING' | 'UNKNOWN_NEEDS_CHECK';
export type InvoiceKind = 'INVOICE' | 'CREDIT_NOTE' | 'DEBIT_NOTE_FUTURE';
export type InvoiceLetter = 'A' | 'B' | 'C' | 'M' | 'E_FUTURE';
export type ConceptType = 'PRODUCTS' | 'SERVICES' | 'PRODUCTS_AND_SERVICES';

export type InvoiceCustomer = {
  id: string;
  legalName: string;
  documentType?: string;
  documentNumber?: string;
  taxCondition?: string;
};

export type InvoiceItemRecord = {
  id: string;
  productId?: string | null;
  lineOrder: number;
  itemCode?: string | null;
  description: string;
  quantity: string | number;
  unitPrice: string | number;
  discountAmount: string | number;
  subtotalAmount: string | number;
  vatRate?: string | number | null;
  vatAmount: string | number;
  totalAmount: string | number;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceEventRecord = {
  id: string;
  eventType: string;
  previousStatus?: InvoiceStatus | null;
  newStatus?: InvoiceStatus | null;
  message?: string | null;
  createdAt: string;
};

export type InvoiceRecord = {
  id: string;
  companyId: string;
  salesPointId?: string | null;
  customerId?: string | null;
  createdByUserId: string;
  invoiceKind: InvoiceKind;
  invoiceLetter: InvoiceLetter;
  invoiceNumber?: number | null;
  fullInvoiceCode?: string | null;
  conceptType?: ConceptType | null;
  currencyCode?: string | null;
  currencyRate?: string | number | null;
  issueDate?: string | null;
  serviceFromDate?: string | null;
  serviceToDate?: string | null;
  dueDate?: string | null;
  subtotalAmount: string | number;
  taxAmount: string | number;
  otherTaxesAmount?: string | number;
  totalAmount: string | number;
  status: InvoiceStatus;
  arcaStatus: ArcaInvoiceStatus;
  cae?: string | null;
  caeDueDate?: string | null;
  arcaResultCode?: string | null;
  arcaObservationsSummary?: string | null;
  emittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: InvoiceCustomer | null;
  items?: InvoiceItemRecord[];
  events?: InvoiceEventRecord[];
};

export type InvoiceListFilters = {
  q?: string;
  status?: InvoiceStatus | 'all';
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type InvoiceCreateInput = {
  invoiceKind: InvoiceKind;
  invoiceLetter: InvoiceLetter;
  customerId?: string;
  salesPointId?: string;
  conceptType?: ConceptType;
  currencyCode?: string;
  currencyRate?: string;
  issueDate?: string;
};

export type InvoiceUpdateInput = {
  customerId?: string;
  salesPointId?: string;
  conceptType?: ConceptType;
  currencyCode?: string;
  currencyRate?: string;
  issueDate?: string;
};

export type InvoiceItemCreateInput = {
  productId?: string;
  itemCode?: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount?: string;
  vatRate?: string;
};

export type InvoiceItemUpdateInput = {
  description?: string;
  quantity?: string;
  unitPrice?: string;
  discountAmount?: string;
  vatRate?: string;
};

export type InvoiceValidation = {
  invoiceId: string;
  canIssue: boolean;
  blockers: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
};

export type InvoiceIssueResult = {
  invoiceId: string;
  status: 'SENDING' | 'FAILED' | 'ISSUED';
  arcaStatus: ArcaInvoiceStatus;
  message: string;
  blockers?: Array<{ code: string; message: string }>;
};

export type CustomerOption = {
  id: string;
  legalName: string;
  documentNumber: string;
  documentType?: string;
  taxCondition?: string;
};

export type SalesPointOption = {
  id: string;
  posNumber: number;
  name?: string | null;
  status?: string;
};

export type ProductOption = {
  id: string;
  code?: string | null;
  name: string;
  referencePrice?: string | number | null;
  vatRate?: string | number | null;
  isActive?: boolean;
};

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Borrador',
  READY: 'Lista',
  SENDING: 'Enviando',
  ISSUED: 'Emitida',
  FAILED: 'Fallida',
  CANCELLED_LOGICALLY: 'Cancelada',
};

const arcaStatusLabels: Record<ArcaInvoiceStatus, string> = {
  NOT_SENT: 'No enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  PARTIAL_WARNING: 'Con aviso',
  UNKNOWN_NEEDS_CHECK: 'Pendiente de revision',
};

const invoiceKindLabels: Record<InvoiceKind, string> = {
  INVOICE: 'Factura',
  CREDIT_NOTE: 'Nota de credito',
  DEBIT_NOTE_FUTURE: 'Nota de debito',
};

const invoiceLetterLabels: Record<InvoiceLetter, string> = {
  A: 'A',
  B: 'B',
  C: 'C',
  M: 'M',
  E_FUTURE: 'E futura',
};

const conceptTypeLabels: Record<ConceptType, string> = {
  PRODUCTS: 'Productos',
  SERVICES: 'Servicios',
  PRODUCTS_AND_SERVICES: 'Productos y servicios',
};

const eventLabels: Record<string, string> = {
  DRAFT_CREATED: 'Borrador creado',
  DRAFT_UPDATED: 'Borrador actualizado',
  VALIDATION_PASSED: 'Validacion aprobada',
  VALIDATION_FAILED: 'Validacion fallida',
  EMISSION_REQUESTED: 'Emision solicitada',
  EMISSION_SENT: 'Emision enviada',
  EMISSION_ACCEPTED: 'Emision aceptada',
  EMISSION_REJECTED: 'Emision rechazada',
  PDF_GENERATED: 'PDF generado',
  MANUALLY_MARKED_FOR_REVIEW: 'Marcada para revision',
};

export function invoiceStatusLabel(status?: InvoiceStatus | null) {
  if (!status) return 'Sin estado';
  return invoiceStatusLabels[status];
}

export function invoiceStatusTone(status?: InvoiceStatus | null) {
  switch (status) {
    case 'ISSUED':
      return 'success' as const;
    case 'FAILED':
    case 'CANCELLED_LOGICALLY':
      return 'danger' as const;
    case 'DRAFT':
    case 'READY':
    case 'SENDING':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
}

export function arcaStatusLabel(status?: ArcaInvoiceStatus | null) {
  if (!status) return 'Sin estado';
  return arcaStatusLabels[status];
}

export function arcaStatusTone(status?: ArcaInvoiceStatus | null) {
  switch (status) {
    case 'ACCEPTED':
      return 'success' as const;
    case 'REJECTED':
      return 'danger' as const;
    case 'PARTIAL_WARNING':
    case 'UNKNOWN_NEEDS_CHECK':
      return 'warning' as const;
    default:
      return 'default' as const;
  }
}

export function invoiceKindLabel(kind?: InvoiceKind | null) {
  if (!kind) return 'Sin tipo';
  return invoiceKindLabels[kind];
}

export function invoiceLetterLabel(letter?: InvoiceLetter | null) {
  if (!letter) return 'Sin letra';
  return invoiceLetterLabels[letter];
}

export function conceptTypeLabel(concept?: ConceptType | null) {
  if (!concept) return 'Sin concepto';
  return conceptTypeLabels[concept];
}

export function invoiceEventLabel(eventType?: string | null) {
  if (!eventType) return 'Evento';
  return eventLabels[eventType] ?? eventType;
}

export function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatQuantity(value?: string | number | null) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateTime(value?: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateOnly(value?: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(date);
}

export function toDateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function fromDateInputValue(value: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`).toISOString();
}

export function getDefaultInvoiceDate() {
  return new Date().toISOString().slice(0, 10);
}

