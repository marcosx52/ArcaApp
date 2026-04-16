'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/feedback/loading-state';
import { mapError } from '@/lib/error-mapping';
import { getActiveCompanyId } from '@/lib/auth';
import {
  conceptTypeLabel,
  formatDateOnly,
  getDefaultInvoiceDate,
  invoiceKindLabel,
  invoiceLetterLabel,
  type InvoiceCreateInput,
  type InvoiceKind,
  type InvoiceLetter,
  type ConceptType,
} from '../lib/invoices';
import {
  createInvoice,
  listInvoiceCustomers,
  listInvoiceSalesPoints,
} from '../lib/invoices-api';

const invoiceKindOptions: Array<{ value: InvoiceKind; label: string }> = [
  { value: 'INVOICE', label: 'Factura' },
  { value: 'CREDIT_NOTE', label: 'Nota de credito' },
  { value: 'DEBIT_NOTE_FUTURE', label: 'Nota de debito' },
];

const invoiceLetterOptions: Array<{ value: InvoiceLetter; label: string }> = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'M', label: 'M' },
];

const conceptOptions: Array<{ value: ConceptType; label: string }> = [
  { value: 'PRODUCTS', label: 'Productos' },
  { value: 'SERVICES', label: 'Servicios' },
  { value: 'PRODUCTS_AND_SERVICES', label: 'Productos y servicios' },
];

export function NewInvoiceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeCompanyId = getActiveCompanyId();

  const [invoiceKind, setInvoiceKind] = useState<InvoiceKind>('INVOICE');
  const [invoiceLetter, setInvoiceLetter] = useState<InvoiceLetter>('C');
  const [conceptType, setConceptType] = useState<ConceptType>('PRODUCTS_AND_SERVICES');
  const [customerId, setCustomerId] = useState('');
  const [salesPointId, setSalesPointId] = useState('');
  const [issueDate, setIssueDate] = useState(getDefaultInvoiceDate());
  const [currencyCode, setCurrencyCode] = useState('PES');
  const [currencyRate, setCurrencyRate] = useState('1');

  useEffect(() => {
    if (!invoiceLetterOptions.some((option) => option.value === invoiceLetter)) {
      setInvoiceLetter('C');
    }
  }, [invoiceLetter]);

  const customersQuery = useQuery({
    queryKey: ['invoice-customers'],
    queryFn: listInvoiceCustomers,
  });

  const salesPointsQuery = useQuery({
    queryKey: ['invoice-sales-points', activeCompanyId],
    queryFn: () => {
      if (!activeCompanyId) {
        throw new Error('Debes seleccionar una empresa activa antes de crear comprobantes.');
      }
      return listInvoiceSalesPoints(activeCompanyId);
    },
    enabled: Boolean(activeCompanyId),
    retry: 0,
  });

  useEffect(() => {
    if (!customerId && customersQuery.data?.[0]?.id) {
      setCustomerId(customersQuery.data[0].id);
    }
  }, [customerId, customersQuery.data]);

  useEffect(() => {
    if (!salesPointId && salesPointsQuery.data?.[0]?.id) {
      setSalesPointId(salesPointsQuery.data[0].id);
    }
  }, [salesPointId, salesPointsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (payload: InvoiceCreateInput) => createInvoice(payload),
    onSuccess: async (invoice) => {
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/invoices/${invoice.id}`);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createMutation.mutate({
      invoiceKind,
      invoiceLetter,
      conceptType,
      customerId: customerId || undefined,
      salesPointId: salesPointId || undefined,
      issueDate: issueDate ? new Date(`${issueDate}T00:00:00`).toISOString() : undefined,
      currencyCode,
      currencyRate,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <PlusCircle className="h-3.5 w-3.5" />
            Nuevo borrador
          </div>
          <div>
            <CardTitle>Nueva invoice</CardTitle>
            <CardDescription>Creemos un borrador real y dejemos listo el flujo para completar items y emitir.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {createMutation.isError ? (
            <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-950/50 dark:bg-red-950/20">
              <p className="font-medium">No pudimos crear el borrador.</p>
              <p className="mt-1">{mapError(createMutation.error)}</p>
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={invoiceKind}
                  onChange={(event) => setInvoiceKind(event.target.value as InvoiceKind)}
                >
                  {invoiceKindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Letra</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={invoiceLetter}
                  onChange={(event) => setInvoiceLetter(event.target.value as InvoiceLetter)}
                >
                  {invoiceLetterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Cliente</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                >
                  <option value="">Sin cliente por ahora</option>
                  {customersQuery.data?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.legalName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Punto de venta</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={salesPointId}
                  onChange={(event) => setSalesPointId(event.target.value)}
                  disabled={!activeCompanyId || salesPointsQuery.isLoading}
                >
                  <option value="">Sin definir</option>
                  {salesPointsQuery.data?.map((salesPoint) => (
                    <option key={salesPoint.id} value={salesPoint.id}>
                      {salesPoint.posNumber} {salesPoint.name ? `- ${salesPoint.name}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Concepto</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={conceptType}
                  onChange={(event) => setConceptType(event.target.value as ConceptType)}
                >
                  {conceptOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Fecha de emision</span>
                <Input type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Moneda</span>
                <Input value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)} />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Cotizacion</span>
                <Input value={currencyRate} onChange={(event) => setCurrencyRate(event.target.value)} />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Crear borrador
              </Button>
              <Button variant="outline" type="button" onClick={() => router.push('/invoices')}>
                Volver al listado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>El borrador quedara disponible para completar items en el detalle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Tipo</span>
              <span className="font-medium">{invoiceKindLabel(invoiceKind)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Letra</span>
              <span className="font-medium">{invoiceLetterLabel(invoiceLetter)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Concepto</span>
              <span className="font-medium">{conceptTypeLabel(conceptType)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Fecha</span>
              <span className="font-medium">{formatDateOnly(issueDate ? `${issueDate}T00:00:00` : undefined)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist rapido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span>Cliente</span>
              <span className="font-medium">{customerId ? 'Seleccionado' : 'Opcional'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Punto de venta</span>
              <span className="font-medium">{salesPointId ? 'Seleccionado' : 'Pendiente'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Items</span>
              <span className="font-medium">Se agregan en el detalle</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Emision</span>
              <span className="font-medium">Disponible luego de validar</span>
            </div>
          </CardContent>
        </Card>

        {(customersQuery.isLoading || salesPointsQuery.isLoading) && !createMutation.isPending ? (
          <LoadingState label="Cargando datos auxiliares..." />
        ) : null}

        {customersQuery.isError || salesPointsQuery.isError ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-950/50 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-medium">Hay un dato auxiliar con problema.</p>
            <p className="mt-1">
              {mapError(customersQuery.error ?? salesPointsQuery.error)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-amber-700/80 dark:text-amber-300/70">
              No bloquea la creacion si ya tenes un cliente y un punto de venta seleccionados.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
