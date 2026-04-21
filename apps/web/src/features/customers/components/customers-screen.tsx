'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, Mail, PencilLine, Phone, Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { listCustomers } from '../lib/customers-api';
import { customerTypeLabel, formatCustomerDocument } from '../lib/customers';

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export function CustomersScreen() {
  const companyId = getActiveCompanyId();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const debouncedSearch = useDebouncedValue(search.trim());

  const customersQuery = useQuery({
    queryKey: ['customers', companyId ?? 'no-company', 'list', debouncedSearch, statusFilter],
    queryFn: () =>
      listCustomers({
        q: debouncedSearch || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
    enabled: Boolean(companyId),
  });

  const customers = customersQuery.data ?? [];

  if (!companyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <CardTitle>Clientes</CardTitle>
            <CardDescription>Listado real conectado al backend para buscar, crear, editar y archivar clientes.</CardDescription>
          </div>
          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo cliente
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Buscar por nombre o documento..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="archived">Archivados</option>
            </select>

            <p className="text-sm text-slate-500">
              {customersQuery.isFetching && !customersQuery.isLoading ? 'Actualizando...' : `${customers.length} resultado(s)`}
            </p>
          </div>

          {customersQuery.isLoading ? <LoadingState label="Cargando clientes..." /> : null}

          {customersQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p className="font-medium">No pudimos cargar los clientes.</p>
              <p className="mt-1">{mapError(customersQuery.error)}</p>
              <button
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                onClick={() => customersQuery.refetch()}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!customersQuery.isLoading && !customersQuery.isError && customers.length === 0 ? (
            <EmptyState
              title="Todavia no hay clientes"
              description="Podes crear el primer cliente o cambiar el filtro para revisar archivados."
              actionLabel="Crear cliente"
              actionHref="/customers/new"
            />
          ) : null}

          {!customersQuery.isLoading && !customersQuery.isError && customers.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Documento</th>
                    <th className="px-4 py-3 font-medium">Condicion</th>
                    <th className="px-4 py-3 font-medium">Contacto</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{customer.legalName}</div>
                        <div className="mt-1 text-xs text-slate-500">{customerTypeLabel(customer.customerType)}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatCustomerDocument(customer)}</td>
                      <td className="px-4 py-4 text-slate-600">{customer.taxCondition}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="space-y-1">
                          {customer.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>{customer.email}</span>
                            </div>
                          ) : null}
                          {customer.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          ) : null}
                          {!customer.email && !customer.phone ? <span className="text-slate-400">Sin datos</span> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge tone={customer.isActive ? 'success' : 'danger'}>
                            {customer.isActive ? 'Activo' : 'Archivado'}
                          </StatusBadge>
                          {customer.isFrequent ? <StatusBadge tone="warning">Frecuente</StatusBadge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <PencilLine className="h-4 w-4" />
                          Ver y editar
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
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Listado real</p>
                <p className="font-medium">Conectado a `/customers`</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Busqueda y estado</p>
                <p className="font-medium">Por nombre, documento y archivo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Alta, edicion y archivo</p>
                <p className="font-medium">Flujo funcional end-to-end</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
