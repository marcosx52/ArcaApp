'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Package2, PencilLine, PlusCircle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { listProducts } from '../lib/products-api';
import { formatProductPrice, productItemTypeLabel, productTaxTreatmentLabel } from '../lib/products';

function useDebouncedValue(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export function ProductsScreen() {
  const companyId = getActiveCompanyId();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const debouncedSearch = useDebouncedValue(search.trim());

  const productsQuery = useQuery({
    queryKey: ['products', companyId ?? 'no-company', 'list', debouncedSearch, statusFilter],
    queryFn: () =>
      listProducts({
        q: debouncedSearch || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }),
    enabled: Boolean(companyId),
  });

  const products = productsQuery.data ?? [];

  if (!companyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <CardTitle>Productos</CardTitle>
            <CardDescription>Listado real conectado al backend para buscar, crear, editar y archivar productos.</CardDescription>
          </div>
          <Link
            href="/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo producto
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Buscar por nombre..."
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
              {productsQuery.isFetching && !productsQuery.isLoading ? 'Actualizando...' : `${products.length} resultado(s)`}
            </p>
          </div>

          {productsQuery.isLoading ? <LoadingState label="Cargando productos..." /> : null}

          {productsQuery.isError ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p className="font-medium">No pudimos cargar los productos.</p>
              <p className="mt-1">{mapError(productsQuery.error)}</p>
              <button
                className="mt-4 inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                onClick={() => productsQuery.refetch()}
                type="button"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
            <EmptyState
              title="Todavia no hay productos"
              description="Podes crear el primer producto o cambiar el filtro para revisar archivados."
              actionLabel="Crear producto"
              actionHref="/products/new"
            />
          ) : null}

          {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium">IVA</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{product.code ? `Codigo ${product.code}` : 'Sin codigo'}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div>{productItemTypeLabel(product.itemType)}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {product.taxTreatment ? productTaxTreatmentLabel(product.taxTreatment) : 'Sin tratamiento fiscal'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatProductPrice(product.referencePrice)}</td>
                      <td className="px-4 py-4 text-slate-600">{product.vatRate ? `${product.vatRate}%` : 'Sin IVA'}</td>
                      <td className="px-4 py-4">
                        <StatusBadge tone={product.isActive ? 'success' : 'danger'}>
                          {product.isActive ? 'Activo' : 'Archivado'}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/products/${product.id}`}
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
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Listado real</p>
                <p className="font-medium">Conectado a `/products`</p>
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
                <p className="font-medium">Por nombre y filtro activo/archivado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Alta y edicion</p>
                <p className="font-medium">Flujo funcional end-to-end con archivo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
