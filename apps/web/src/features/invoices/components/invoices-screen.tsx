'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, CircleDollarSign, FileText, Filter, PlusCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Input } from '@/components/ui/input';
import { mapError } from '@/lib/error-mapping';
import {
  arcaStatusLabel,
  arcaStatusTone,
  formatDateOnly,
  formatMoney,
  invoiceKindLabel,
  invoiceLetterLabel,
  invoiceStatusLabel,
  invoiceStatusTone,
  type InvoiceRecord,
  type InvoiceStatus,
} from '../lib/invoices';
import { listInvoiceCustomers, listInvoices } from '../lib/invoices-api';

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
function matchesSearch(invoice: InvoiceRecord, search: string) {
  if (!search) return true;

  const haystack = [
    invoice.fullInvoiceCode ?? '',
    invoice.invoiceNumber?.toString() ?? '',
    invoice.customer?.legalName ?? '',
    invoice.customer?.documentNumber ?? '',
    invoice.invoiceKind,
    invoice.invoiceLetter,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

const statusOptions: Array<{ value: 'all' | InvoiceStatus; label: string }> = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borradores' },
  { value: 'READY', label: 'Listas' },
  { value: 'SENDING', label: 'Enviando' },
  { value: 'ISSUED', label: 'Emitidas' },
  { value: 'FAILED', label: 'Fallidas' },
  { value: 'CANCELLED_LOGICALLY', label: 'Canceladas' },
];

export function InvoicesScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const debouncedSearch = useDebouncedValue(search.trim());

  const invoicesQuery = useQuery({
    queryKey: ['invoices', statusFilter, customerFilter],
    queryFn: () =>
      listInvoices({
        status: statusFilter,
        customerId: customerFilter === 'all' ? undefined : customerFilter,
      }),
  });

  const customersQuery = useQuery({
    queryKey: ['invoice-customers'],
    queryFn: listInvoiceCustomers,
    retry: 0,
  });

  const invoices = (invoicesQuery.data ?? []).filter(
    (invoice) => matchesSearch(invoice, debouncedSearch) && (customerFilter === 'all' || invoice.customerId === customerFilter),
  );

  const counts = invoices.reduce(
    (acc, invoice) => {
      acc.total += 1;
      acc.amount += Number(invoice.totalAmount ?? 0);
      acc[invoice.status] += 1;
      return acc;
    },
    {
      total: 0,
      amount: 0,
      DRAFT: 0,
      READY: 0,
      SENDING: 0,
      ISSUED: 0,
      FAILED: 0,
      CANCELLED_LOGICALLY: 0,
    } satisfies Record<'total' | 'amount' | InvoiceStatus, number>,
  );

  const hasFilters = search.length > 0 || statusFilter !== 'all' || customerFilter !== 'all';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700 px-6 py-6 text-slate-50 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 dark:text-slate-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">Comprobantes</p>
              <h2 className="text-3xl font-semibold tracking-tight">Listado real de invoices</h2>
              <p className="max-w-2xl text-sm text-slate-300 dark:text-slate-700">
                Conectado a `/invoices`, con filtros utiles, acceso al detalle y acciones de trabajo diario.
              </p>
            </div>
            <Link
              href="/invoices/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <PlusCircle className="h-4 w-4" />
              Nuevo borrador
            </Link>
          </div>
        </div>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Importe</p>
              <p className="mt-2 text-2xl font-semibold">{formatMoney(counts.amount)}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Borradores</p>
              <p className="mt-2 text-2xl font-semibold">{counts.DRAFT}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500">Emitidas</p>
              <p className="mt-2 text-2xl font-semibold">{counts.ISSUED}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Buscar por numero, cliente o tipo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | InvoiceStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
            >
              <option value="all">Todos los clientes</option>
              {customersQuery.data?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.legalName}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="h-4 w-4" />
              {invoicesQuery.isFetching && !invoicesQuery.isLoading ? 'Actualizando...' : `${invoices.length} resultado(s)`}
            </div>
          </div>

          {invoicesQuery.isLoading ? <LoadingState label="Cargando comprobantes..." /> : null}

          {invoicesQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-950/50 dark:bg-red-950/20">
              <p className="font-medium">No pudimos cargar los comprobantes.</p>
              <p className="mt-1">{mapError(invoicesQuery.error)}</p>
              <button
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-950 dark:text-red-300"
                onClick={() => invoicesQuery.refetch()}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length === 0 ? (
            hasFilters ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-lg font-semibold">No encontramos coincidencias</p>
                <p className="mt-2 text-sm text-slate-500">Proba limpiando filtros o buscando por otro numero de comprobante.</p>
                <button
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setCustomerFilter('all');
                  }}
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <EmptyState
                title="Todavia no hay comprobantes"
                description="Creemos el primer borrador para empezar a trabajar con el flujo real."
                actionLabel="Crear borrador"
                actionHref="/invoices/new"
              />
            )
          ) : null}

          {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Comprobante</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">ARCA</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/50">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-50">
                          {invoice.fullInvoiceCode ?? `${invoice.invoiceLetter}-${invoice.invoiceNumber ?? 'BORRADOR'}`}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {invoiceKindLabel(invoice.invoiceKind)} - {invoiceLetterLabel(invoice.invoiceLetter)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {invoice.customer?.legalName ?? 'Sin cliente'}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDateOnly(invoice.issueDate ?? invoice.createdAt)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatMoney(invoice.totalAmount)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</StatusBadge>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={arcaStatusTone(invoice.arcaStatus)}>{arcaStatusLabel(invoice.arcaStatus)}</StatusBadge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          Ver detalle
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Detalle real</p>
                <p className="font-medium">Cada comprobante abre su pantalla</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Estado fiscal</p>
                <p className="font-medium">Seguimos estado local y de ARCA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Flujo util</p>
                <p className="font-medium">Borrador, validacion y emision basica</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
