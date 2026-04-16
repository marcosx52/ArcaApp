'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  PencilLine,
  PlusCircle,
  Send,
  Trash2,
  WandSparkles,
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
  type InvoiceItemRecord,
  type InvoiceRecord,
  type InvoiceValidation,
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

export function InvoiceDetailScreen({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
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
    onSuccess: () => invoiceQuery.refetch(),
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
      await invoiceQuery.refetch();
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
      await invoiceQuery.refetch();
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => deleteInvoiceItem(itemId),
    onSuccess: () => invoiceQuery.refetch(),
  });

  const validate = useMutation({
    mutationFn: () => validateInvoice(invoiceId),
    onSuccess: (result) => {
      setValidation(result);
      setIssueMessage('');
    },
  });

  const issue = useMutation({
    mutationFn: () => issueInvoice(invoiceId),
    onSuccess: async (result) => {
      setIssueMessage(result.message);
      await invoiceQuery.refetch();
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
        <StatusBadge tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</StatusBadge>
        <StatusBadge tone={arcaStatusTone(invoice.arcaStatus)}>{arcaStatusLabel(invoice.arcaStatus)}</StatusBadge>
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
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" type="button" onClick={() => validate.mutate()} disabled={validate.isPending}>
                {validate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                Validar
              </Button>
              <Button type="button" onClick={() => issue.mutate()} disabled={issue.isPending || !canEdit}>
                {issue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Emitir
              </Button>
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

          {validation ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 font-medium">
                <WandSparkles className="h-4 w-4" />
                Validacion
              </div>
              <p className="mt-2">{validation.canIssue ? 'La invoice ya puede emitirse.' : 'Aun hay bloqueos para emitir.'}</p>
              {validation.blockers.length > 0 ? <IssueList title="Bloqueos" items={validation.blockers.map((item) => item.message)} tone="red" /> : null}
              {validation.warnings.length > 0 ? <IssueList title="Avisos" items={validation.warnings.map((item) => item.message)} tone="amber" /> : null}
            </div>
          ) : null}

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
                <div key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{invoiceEventLabel(event.eventType)}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{formatDateTime(event.createdAt)}</p>
                    </div>
                    <StatusBadge tone={invoiceStatusTone((event.newStatus ?? event.previousStatus ?? invoice.status) as any)}>
                      {invoiceStatusLabel((event.newStatus ?? event.previousStatus ?? invoice.status) as any)}
                    </StatusBadge>
                  </div>
                  {event.message ? <p className="mt-3 text-slate-600 dark:text-slate-300">{event.message}</p> : null}
                </div>
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

function IssueList({ title, items, tone }: { title: string; items: string[]; tone: 'red' | 'amber' }) {
  const textClass = tone === 'red' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300';
  return (
    <div className={`mt-3 ${textClass}`}>
      <p className="font-medium">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item}>- {item}</li>
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
