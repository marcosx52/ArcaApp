'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Info,
  Loader2,
  PencilLine,
  PlusCircle,
  ReceiptText,
  Send,
  ShieldCheck,
  Trash2,
  WandSparkles,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Input } from '@/components/ui/input';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import {
  arcaStatusLabel,
  arcaStatusTone,
  conceptTypeLabel,
  formatDateOnly,
  formatDateTime,
  formatMoney,
  formatQuantity,
  invoiceEventLabel,
  invoiceKindLabel,
  invoiceLetterLabel,
  invoiceStatusLabel,
  invoiceStatusTone,
  toDateInputValue,
  type InvoiceEventRecord,
  type InvoiceItemRecord,
  type InvoiceRecord,
  type InvoiceStatus,
  type InvoiceValidation,
  type InvoiceValidationMessage,
  type InvoiceValidationSnapshot,
  type ProductOption,
} from '../lib/invoices';
import {
  addInvoiceItem,
  deleteInvoiceItem,
  getInvoice,
  issueInvoice,
  listInvoiceCustomers,
  listInvoiceProducts,
  listInvoiceSalesPoints,
  updateInvoice,
  updateInvoiceItem,
  validateInvoice,
} from '../lib/invoices-api';

type HeaderState = {
  customerId: string;
  salesPointId: string;
  conceptType: string;
  currencyCode: string;
  currencyRate: string;
  issueDate: string;
};

type ItemState = {
  productId: string;
  itemCode: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  vatRate: string;
};

function headerStateFromInvoice(invoice?: InvoiceRecord | null): HeaderState {
  return {
    customerId: invoice?.customerId ?? '',
    salesPointId: invoice?.salesPointId ?? '',
    conceptType: invoice?.conceptType ?? 'PRODUCTS_AND_SERVICES',
    currencyCode: invoice?.currencyCode ?? 'PES',
    currencyRate: String(invoice?.currencyRate ?? '1'),
    issueDate: toDateInputValue(invoice?.issueDate ?? invoice?.createdAt ?? null),
  };
}

function itemStateFromProduct(product?: ProductOption | null): ItemState {
  return {
    productId: product?.id ?? '',
    itemCode: product?.code ?? '',
    description: product?.name ?? '',
    quantity: '1',
    unitPrice: String(product?.referencePrice ?? '0'),
    discountAmount: '0',
    vatRate: product?.vatRate != null ? String(product.vatRate) : '',
  };
}

function itemStateFromItem(item: InvoiceItemRecord): ItemState {
  return {
    productId: item.productId ?? '',
    itemCode: item.itemCode ?? '',
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    discountAmount: String(item.discountAmount ?? '0'),
    vatRate: item.vatRate != null ? String(item.vatRate) : '',
  };
}

const statusDetails: Record<InvoiceStatus, { title: string; description: string }> = {
  DRAFT: {
    title: 'Borrador editable',
    description: 'Necesita una validacion funcional antes de quedar listo.',
  },
  READY: {
    title: 'Listo para emitir',
    description: 'La ultima validacion no encontro bloqueos.',
  },
  SENDING: {
    title: 'Envio solicitado',
    description: 'El flujo local ya salio del borrador.',
  },
  ISSUED: {
    title: 'Emitido',
    description: 'Comprobante cerrado para edicion operativa.',
  },
  FAILED: {
    title: 'Con error',
    description: 'Revisa el historial y los bloqueos antes de continuar.',
  },
  CANCELLED_LOGICALLY: {
    title: 'Cancelado',
    description: 'Comprobante cancelado logicamente.',
  },
};

function getStatusDetail(status: InvoiceStatus) {
  return statusDetails[status] ?? { title: invoiceStatusLabel(status), description: 'Estado del comprobante.' };
}

function validationIssueArea(code: string) {
  switch (code) {
    case 'missing_customer':
      return 'Cabecera';
    case 'missing_sales_point':
      return 'Punto de venta';
    case 'missing_items':
      return 'Items';
    case 'invoice_not_ready':
    case 'invalid_status':
      return 'Estado';
    default:
      return 'Validacion';
  }
}

function normalizeValidationMessages(messages?: InvoiceValidationMessage[] | null) {
  return Array.isArray(messages)
    ? messages.filter((item) => item && typeof item.message === 'string')
    : [];
}

function getEventValidationSnapshot(event?: InvoiceEventRecord | null): InvoiceValidationSnapshot | null {
  const snapshot = event?.payloadSnapshot;
  if (!snapshot || typeof snapshot.canIssue !== 'boolean') return null;

  return {
    canIssue: snapshot.canIssue,
    blockers: normalizeValidationMessages(snapshot.blockers),
    warnings: normalizeValidationMessages(snapshot.warnings),
    previousStatus: snapshot.previousStatus ?? event?.previousStatus ?? null,
    status: snapshot.status ?? event?.newStatus ?? null,
  };
}

function eventHappenedAfter(event: InvoiceEventRecord, reference: InvoiceEventRecord) {
  return new Date(event.createdAt).getTime() > new Date(reference.createdAt).getTime();
}

export function InvoiceDetailScreen({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeCompanyId = getActiveCompanyId();

  const [headerState, setHeaderState] = useState<HeaderState>(headerStateFromInvoice());
  const [itemState, setItemState] = useState<ItemState>(itemStateFromProduct());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [validation, setValidation] = useState<InvoiceValidation | null>(null);
  const [issueMessage, setIssueMessage] = useState('');

  const invoiceQuery = useQuery({ queryKey: ['invoice', invoiceId], queryFn: () => getInvoice(invoiceId) });
  const customersQuery = useQuery({ queryKey: ['invoice-customers'], queryFn: listInvoiceCustomers, retry: 0 });
  const salesPointsQuery = useQuery({
    queryKey: ['invoice-sales-points', activeCompanyId],
    queryFn: () => {
      if (!activeCompanyId) throw new Error('Falta empresa activa.');
      return listInvoiceSalesPoints(activeCompanyId);
    },
    enabled: Boolean(activeCompanyId),
    retry: 0,
  });
  const productsQuery = useQuery({ queryKey: ['invoice-products'], queryFn: listInvoiceProducts, retry: 0 });

  const invoice = invoiceQuery.data ?? null;
  const canEdit = invoice ? ['DRAFT', 'READY', 'FAILED'].includes(invoice.status) : false;
  const items = [...(invoice?.items ?? [])].sort((a, b) => a.lineOrder - b.lineOrder);
  const events = [...(invoice?.events ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestValidationEvent =
    events.find((event) => event.eventType === 'VALIDATION_PASSED' || event.eventType === 'VALIDATION_FAILED') ?? null;
  const latestValidationIsStale =
    !validation &&
    Boolean(
      latestValidationEvent &&
        events.some((event) => event.eventType === 'DRAFT_UPDATED' && eventHappenedAfter(event, latestValidationEvent)),
    );
  const latestValidation: InvoiceValidationSnapshot | null = validation
    ? {
        canIssue: validation.canIssue,
        blockers: validation.blockers,
        warnings: validation.warnings,
        previousStatus: validation.previousStatus ?? null,
        status: validation.status ?? null,
      }
    : latestValidationIsStale
      ? null
      : getEventValidationSnapshot(latestValidationEvent);
  const statusDetail = invoice ? getStatusDetail(invoice.status) : null;

  useEffect(() => {
    if (invoice) {
      setHeaderState(headerStateFromInvoice(invoice));
      if (!editingItemId) setItemState(itemStateFromProduct(productsQuery.data?.[0]));
    }
  }, [editingItemId, invoice, productsQuery.data]);

  const saveHeader = useMutation({
    mutationFn: () =>
      updateInvoice(invoiceId, {
        customerId: headerState.customerId || undefined,
        salesPointId: headerState.salesPointId || undefined,
        conceptType: headerState.conceptType as any,
        currencyCode: headerState.currencyCode || undefined,
        currencyRate: headerState.currencyRate || undefined,
        issueDate: headerState.issueDate ? new Date(`${headerState.issueDate}T00:00:00`).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setValidation(null);
      setIssueMessage('');
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const addItem = useMutation({
    mutationFn: () =>
      addInvoiceItem(invoiceId, {
        productId: itemState.productId || undefined,
        itemCode: itemState.itemCode || undefined,
        description: itemState.description.trim(),
        quantity: itemState.quantity,
        unitPrice: itemState.unitPrice,
        discountAmount: itemState.discountAmount || undefined,
        vatRate: itemState.vatRate || undefined,
      }),
    onSuccess: async () => {
      setEditingItemId(null);
      setItemState(itemStateFromProduct(productsQuery.data?.[0]));
      setValidation(null);
      setIssueMessage('');
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const editItem = useMutation({
    mutationFn: () =>
      updateInvoiceItem(editingItemId ?? '', {
        description: itemState.description.trim(),
        quantity: itemState.quantity,
        unitPrice: itemState.unitPrice,
        discountAmount: itemState.discountAmount || undefined,
        vatRate: itemState.vatRate || undefined,
      }),
    onSuccess: async () => {
      setEditingItemId(null);
      setItemState(itemStateFromProduct(productsQuery.data?.[0]));
      setValidation(null);
      setIssueMessage('');
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => deleteInvoiceItem(itemId),
    onSuccess: async () => {
      setValidation(null);
      setIssueMessage('');
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const validate = useMutation({
    mutationFn: () => validateInvoice(invoiceId),
    onSuccess: async (result) => {
      setValidation(result);
      setIssueMessage('');
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const issue = useMutation({
    mutationFn: () => issueInvoice(invoiceId),
    onSuccess: async (result) => {
      setIssueMessage(result.message);
      await invoiceQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  useEffect(() => {
    setValidation(null);
    setIssueMessage('');
  }, [invoiceId]);

  function startEditing(item: InvoiceItemRecord) {
    setEditingItemId(item.id);
    setItemState(itemStateFromItem(item));
  }

  function resetItemForm() {
    setEditingItemId(null);
    setItemState(itemStateFromProduct(productsQuery.data?.[0]));
  }

  if (invoiceQuery.isLoading) return <LoadingState label="Cargando comprobante..." />;

  if (invoiceQuery.isError || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="outline" type="button" onClick={() => router.push('/invoices')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-950/50 dark:bg-red-950/20">
          <p className="font-medium">No pudimos cargar el comprobante.</p>
          <p className="mt-1">{mapError(invoiceQuery.error)}</p>
        </div>
      </div>
    );
  }

  const customer = customersQuery.data?.find((current) => current.id === invoice.customerId) ?? invoice.customer ?? null;
  const salesPoint = salesPointsQuery.data?.find((current) => current.id === invoice.salesPointId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" type="button" onClick={() => router.push('/invoices')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700 px-6 py-6 text-slate-50 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 dark:text-slate-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Detalle</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                {invoice.fullInvoiceCode ?? `${invoice.invoiceLetter}-${invoice.invoiceNumber ?? 'BORRADOR'}`}
              </h2>
              <p className="max-w-2xl text-sm text-slate-300 dark:text-slate-700">
                {customer?.legalName ?? 'Sin cliente'}
                {salesPoint ? ` - PV ${salesPoint.posNumber}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</StatusBadge>
                <StatusBadge tone={arcaStatusTone(invoice.arcaStatus)}>{arcaStatusLabel(invoice.arcaStatus)}</StatusBadge>
              </div>
              <p className="max-w-sm text-left text-sm text-slate-300 dark:text-slate-700 md:text-right">
                {statusDetail?.title}. {statusDetail?.description}
              </p>
              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <Button variant="outline" type="button" onClick={() => validate.mutate()} disabled={validate.isPending} className="gap-2">
                  {validate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                  Validar
                </Button>
                <Button type="button" onClick={() => issue.mutate()} disabled={issue.isPending || !canEdit} className="gap-2">
                  {issue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Emitir
                </Button>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat title="Total" value={formatMoney(invoice.totalAmount)} />
            <Stat title="Subtotal" value={formatMoney(invoice.subtotalAmount)} />
            <Stat title="IVA" value={formatMoney(invoice.taxAmount)} />
            <Stat title="Items" value={String(items.length)} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
            <StatusPanel invoice={invoice} latestValidationAt={latestValidationEvent?.createdAt} />
            <ValidationPanel
              validation={latestValidation}
              lastValidatedAt={latestValidationEvent?.createdAt}
              isPending={validate.isPending}
              error={validate.error}
              isStale={latestValidationIsStale}
            />
          </div>

          <DetailGrid invoice={invoice} customerName={customer?.legalName} salesPointLabel={salesPoint ? `PV ${salesPoint.posNumber}${salesPoint.name ? ` - ${salesPoint.name}` : ''}` : null} />

          {issueMessage ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700 dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-emerald-200">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {issueMessage}
              </div>
            </div>
          ) : null}

          {!canEdit ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-950/50 dark:bg-amber-950/20 dark:text-amber-200">
              Este comprobante ya no deberia editarse desde el frontend. Seguimos permitiendo validacion y revision del historial.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Cabecera</CardTitle>
            <CardDescription>Editar cliente, punto de venta y datos de emision.</CardDescription>
          </CardHeader>
          <CardContent>
            {saveHeader.isError ? (
              <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950/50 dark:bg-red-950/20">
                <p className="font-medium">No pudimos guardar la cabecera.</p>
                <p className="mt-1">{mapError(saveHeader.error)}</p>
              </div>
            ) : null}
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => {
              event.preventDefault();
              saveHeader.mutate();
            }}>
              <SelectField
                label="Cliente"
                value={headerState.customerId}
                onChange={(value) => setHeaderState((current) => ({ ...current, customerId: value }))}
                disabled={!canEdit}
                options={[{ value: '', label: 'Sin cliente' }, ...(customersQuery.data ?? []).map((item) => ({ value: item.id, label: item.legalName }))]}
              />
              <SelectField
                label="Punto de venta"
                value={headerState.salesPointId}
                onChange={(value) => setHeaderState((current) => ({ ...current, salesPointId: value }))}
                disabled={!canEdit || !activeCompanyId}
                options={[{ value: '', label: 'Sin definir' }, ...(salesPointsQuery.data ?? []).map((item) => ({ value: item.id, label: `${item.posNumber}${item.name ? ` - ${item.name}` : ''}` }))]}
              />
              <SelectField
                label="Concepto"
                value={headerState.conceptType}
                onChange={(value) => setHeaderState((current) => ({ ...current, conceptType: value }))}
                disabled={!canEdit}
                options={[
                  { value: 'PRODUCTS', label: 'Productos' },
                  { value: 'SERVICES', label: 'Servicios' },
                  { value: 'PRODUCTS_AND_SERVICES', label: 'Productos y servicios' },
                ]}
              />
              <InputField label="Fecha" type="date" value={headerState.issueDate} onChange={(value) => setHeaderState((current) => ({ ...current, issueDate: value }))} disabled={!canEdit} />
              <InputField label="Moneda" value={headerState.currencyCode} onChange={(value) => setHeaderState((current) => ({ ...current, currencyCode: value }))} disabled={!canEdit} />
              <InputField label="Cotizacion" value={headerState.currencyRate} onChange={(value) => setHeaderState((current) => ({ ...current, currencyRate: value }))} disabled={!canEdit} />
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button type="submit" disabled={!canEdit || saveHeader.isPending}>
                  {saveHeader.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                  Guardar cabecera
                </Button>
                <Button variant="outline" type="button" onClick={() => setHeaderState(headerStateFromInvoice(invoice))} disabled={!canEdit}>
                  Revertir
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
            <CardDescription>Eventos y cambios relacionados al comprobante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <EmptyState title="Sin eventos todavia" description="Cuando validemos o emitamos, el historial empezara a completarse." />
            ) : (
              events.map((event) => (
                <HistoryEventCard key={event.id} event={event} fallbackStatus={invoice.status} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingItemId ? 'Editar item' : 'Agregar item'}</CardTitle>
          <CardDescription>Usa productos del catalogo o carga una linea manualmente.</CardDescription>
        </CardHeader>
        <CardContent>
          {addItem.isError || editItem.isError || removeItem.isError ? (
            <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950/50 dark:bg-red-950/20">
              <p className="font-medium">No pudimos guardar los items.</p>
              <p className="mt-1">{mapError(addItem.error ?? editItem.error ?? removeItem.error)}</p>
            </div>
          ) : null}
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => {
            event.preventDefault();
            if (editingItemId) {
              editItem.mutate();
            } else {
              addItem.mutate();
            }
          }}>
            <SelectField
              label="Producto"
              value={itemState.productId}
              onChange={(value) => {
                const product = productsQuery.data?.find((current) => current.id === value) ?? null;
                setItemState((current) => ({
                  ...itemStateFromProduct(product),
                  productId: value,
                  description: current.description || product?.name || '',
                  itemCode: current.itemCode || product?.code || '',
                  quantity: current.quantity || '1',
                  discountAmount: current.discountAmount || '0',
                  vatRate: current.vatRate || (product?.vatRate != null ? String(product.vatRate) : ''),
                  unitPrice: current.unitPrice || String(product?.referencePrice ?? '0'),
                }));
              }}
              disabled={!canEdit}
              options={[{ value: '', label: 'Manual' }, ...(productsQuery.data ?? []).map((item) => ({ value: item.id, label: `${item.code ? `${item.code} - ` : ''}${item.name}` }))]}
            />
            <InputField label="Codigo" value={itemState.itemCode} onChange={(value) => setItemState((current) => ({ ...current, itemCode: value }))} disabled={!canEdit} />
            <div className="md:col-span-2">
              <InputField label="Descripcion" value={itemState.description} onChange={(value) => setItemState((current) => ({ ...current, description: value }))} disabled={!canEdit} />
            </div>
            <InputField label="Cantidad" value={itemState.quantity} onChange={(value) => setItemState((current) => ({ ...current, quantity: value }))} disabled={!canEdit} />
            <InputField label="Precio unitario" value={itemState.unitPrice} onChange={(value) => setItemState((current) => ({ ...current, unitPrice: value }))} disabled={!canEdit} />
            <InputField label="Descuento" value={itemState.discountAmount} onChange={(value) => setItemState((current) => ({ ...current, discountAmount: value }))} disabled={!canEdit} />
            <InputField label="IVA %" value={itemState.vatRate} onChange={(value) => setItemState((current) => ({ ...current, vatRate: value }))} disabled={!canEdit} />
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Button type="submit" disabled={!canEdit || addItem.isPending || editItem.isPending}>
                {addItem.isPending || editItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItemId ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                {editingItemId ? 'Guardar item' : 'Agregar item'}
              </Button>
              <Button variant="outline" type="button" onClick={resetItemForm} disabled={!canEdit}>
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items actuales</CardTitle>
          <CardDescription>Tambien podes editar o eliminar lineas ya cargadas.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState title="Aun no hay items" description="Agreguemos la primera linea para poder validar y emitir el comprobante." />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Linea</th>
                    <th className="px-4 py-3 font-medium">Descripcion</th>
                    <th className="px-4 py-3 font-medium">Cantidad</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">IVA</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/50">
                  {items.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.lineOrder}</td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-50">{item.description}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.itemCode ? `Codigo ${item.itemCode}` : 'Sin codigo'}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatQuantity(item.quantity)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatMoney(item.unitPrice)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.vatRate != null ? `${item.vatRate}%` : 'Sin IVA'}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatMoney(item.totalAmount)}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" type="button" onClick={() => startEditing(item)} disabled={!canEdit}>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" type="button" onClick={() => removeItem.mutate(item.id)} disabled={!canEdit || removeItem.isPending}>
                            {removeItem.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusPanel({ invoice, latestValidationAt }: { invoice: InvoiceRecord; latestValidationAt?: string }) {
  const detail = getStatusDetail(invoice.status);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Estado actual</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{detail.title}</p>
          </div>
        </div>
        <StatusBadge tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</StatusBadge>
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{detail.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500">Estado ARCA</p>
          <div className="mt-2">
            <StatusBadge tone={arcaStatusTone(invoice.arcaStatus)}>{arcaStatusLabel(invoice.arcaStatus)}</StatusBadge>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs uppercase tracking-wide text-slate-500">Ultima validacion</p>
          <p className="mt-2 font-medium text-slate-900 dark:text-slate-50">
            {latestValidationAt ? formatDateTime(latestValidationAt) : 'Sin registro'}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailGrid({
  invoice,
  customerName,
  salesPointLabel,
}: {
  invoice: InvoiceRecord;
  customerName?: string | null;
  salesPointLabel?: string | null;
}) {
  const rows = [
    { label: 'Cliente', value: customerName ?? 'Sin cliente' },
    { label: 'Punto de venta', value: salesPointLabel ?? 'Sin definir' },
    { label: 'Tipo', value: `${invoiceKindLabel(invoice.invoiceKind)} ${invoiceLetterLabel(invoice.invoiceLetter)}` },
    { label: 'Concepto', value: conceptTypeLabel(invoice.conceptType) },
    { label: 'Fecha', value: formatDateOnly(invoice.issueDate ?? invoice.createdAt) },
    { label: 'Moneda', value: `${invoice.currencyCode ?? 'PES'} / ${invoice.currencyRate ?? '1'}` },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mb-4 flex items-center gap-2 font-medium">
        <ReceiptText className="h-4 w-4" />
        Lectura del comprobante
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-slate-500">{row.label}</p>
            <p className="mt-1 font-medium text-slate-950 dark:text-slate-50">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationPanel({
  validation,
  lastValidatedAt,
  isPending,
  error,
  isStale,
}: {
  validation: InvoiceValidationSnapshot | null;
  lastValidatedAt?: string;
  isPending: boolean;
  error?: unknown;
  isStale?: boolean;
}) {
  const blockers = normalizeValidationMessages(validation?.blockers);
  const warnings = normalizeValidationMessages(validation?.warnings);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <WandSparkles className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Validacion previa</p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">
              {isPending
                ? 'Validando'
                : validation
                  ? validation.canIssue
                    ? 'Sin bloqueos'
                    : 'Con bloqueos'
                  : isStale
                    ? 'Desactualizada'
                  : 'Sin resultado'}
            </p>
          </div>
        </div>
        {validation ? (
          <StatusBadge tone={validation.canIssue ? 'success' : 'danger'}>{validation.canIssue ? 'Aprobada' : 'Bloqueada'}</StatusBadge>
        ) : null}
      </div>

      {lastValidatedAt ? (
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Ultima ejecucion: {formatDateTime(lastValidatedAt)}</p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-950/50 dark:bg-red-950/20 dark:text-red-300">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" />
            No pudimos ejecutar validate().
          </div>
          <p className="mt-1">{mapError(error)}</p>
        </div>
      ) : null}

      {!validation && !isPending && !error ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
          <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
            <Info className="h-4 w-4" />
            {isStale ? 'La validacion previa quedo desactualizada por cambios posteriores.' : 'Todavia no hay snapshot de validacion.'}
          </div>
        </div>
      ) : null}

      {validation && blockers.length === 0 && warnings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            No hay blockers ni warnings activos.
          </div>
        </div>
      ) : null}

      {blockers.length > 0 ? <IssueList title="Blockers" items={blockers} tone="red" /> : null}
      {warnings.length > 0 ? <IssueList title="Warnings" items={warnings} tone="amber" /> : null}
    </div>
  );
}

function HistoryEventCard({ event, fallbackStatus }: { event: InvoiceEventRecord; fallbackStatus: InvoiceStatus }) {
  const status = event.newStatus ?? event.previousStatus ?? fallbackStatus;
  const validationSnapshot = getEventValidationSnapshot(event);
  const blockers = normalizeValidationMessages(validationSnapshot?.blockers);
  const warnings = normalizeValidationMessages(validationSnapshot?.warnings);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{invoiceEventLabel(event.eventType)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs uppercase tracking-wide text-slate-500">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDateTime(event.createdAt)}
          </p>
        </div>
        <StatusBadge tone={invoiceStatusTone(status)}>{invoiceStatusLabel(status)}</StatusBadge>
      </div>
      {event.previousStatus && event.newStatus && event.previousStatus !== event.newStatus ? (
        <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
          {invoiceStatusLabel(event.previousStatus)} -&gt; {invoiceStatusLabel(event.newStatus)}
        </p>
      ) : null}
      {event.message ? <p className="mt-3 text-slate-600 dark:text-slate-300">{event.message}</p> : null}
      {validationSnapshot ? (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={validationSnapshot.canIssue ? 'success' : 'danger'}>
              {validationSnapshot.canIssue ? 'Validacion aprobada' : 'Validacion bloqueada'}
            </StatusBadge>
            {warnings.length > 0 ? <StatusBadge tone="warning">{warnings.length} warning(s)</StatusBadge> : null}
          </div>
          {blockers.length > 0 ? <IssueList title="Blockers" items={blockers} tone="red" compact /> : null}
          {warnings.length > 0 ? <IssueList title="Warnings" items={warnings} tone="amber" compact /> : null}
        </div>
      ) : null}
    </div>
  );
}

function IssueList({
  title,
  items,
  tone,
  compact = false,
}: {
  title: string;
  items: InvoiceValidationMessage[];
  tone: 'red' | 'amber';
  compact?: boolean;
}) {
  const Icon = tone === 'red' ? XCircle : AlertTriangle;
  const textClass = tone === 'red' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300';
  const itemClass =
    tone === 'red'
      ? 'border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/20'
      : 'border-amber-200 bg-amber-50 dark:border-amber-950/50 dark:bg-amber-950/20';

  return (
    <div className={`mt-3 ${textClass}`}>
      <p className="font-medium">{title}</p>
      <ul className={compact ? 'mt-2 space-y-2' : 'mt-3 space-y-2'}>
        {items.map((item) => (
          <li key={`${item.code}-${item.message}`} className={`rounded-2xl border p-3 ${itemClass}`}>
            <div className="flex gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="inline-flex rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium dark:bg-slate-950/50">
                  {validationIssueArea(item.code)}
                </span>
                <p className="mt-1">{item.message}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <select
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
    </label>
  );
}
