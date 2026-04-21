'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, CalendarDays, PencilLine } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getActiveCompanyId } from '@/lib/auth';
import { mapError } from '@/lib/error-mapping';
import { archiveProduct, getProduct, updateProduct } from '../lib/products-api';
import { formatProductPrice, toProductFormValues, toProductUpdateInput } from '../lib/products';
import { ProductForm } from './product-form';

type ProductDetailScreenProps = {
  productId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getArchiveErrorMessage(error: unknown) {
  const message = mapError(error);

  if (message === 'Request failed') {
    return 'No pudimos archivar el producto. Intenta de nuevo.';
  }

  return `No pudimos archivar el producto. ${message}`;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const companyId = getActiveCompanyId();
  const queryClient = useQueryClient();
  const productDetailQueryKey = ['products', companyId ?? 'no-company', 'detail', productId] as const;
  const productListQueryKey = ['products', companyId ?? 'no-company', 'list'] as const;

  const productQuery = useQuery({
    queryKey: productDetailQueryKey,
    queryFn: () => getProduct(productId),
    enabled: Boolean(companyId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateProduct>[1]) => updateProduct(productId, values),
    onSuccess: async (updatedProduct) => {
      queryClient.setQueryData(productDetailQueryKey, updatedProduct);
      await queryClient.invalidateQueries({ queryKey: productListQueryKey });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveProduct(productId),
    onSuccess: async (archivedProduct) => {
      queryClient.setQueryData(productDetailQueryKey, archivedProduct);
      await queryClient.invalidateQueries({ queryKey: productListQueryKey });
    },
  });

  if (!companyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  if (productQuery.isLoading) {
    return <LoadingState label="Cargando producto..." />;
  }

  if (productQuery.isError) {
    return (
      <EmptyState
        title="No pudimos abrir el producto"
        description={mapError(productQuery.error)}
        actionHref="/products"
        actionLabel="Volver al listado"
      />
    );
  }

  const product = productQuery.data;

  if (!product) {
    return (
      <EmptyState
        title="Producto no encontrado"
        description="Ese registro no existe o no pertenece a la empresa activa."
        actionHref="/products"
        actionLabel="Volver al listado"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <StatusBadge tone={product.isActive ? 'success' : 'danger'}>
          {product.isActive ? 'Activo' : 'Archivado'}
        </StatusBadge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr]">
        <ProductForm
          key={`${product.id}:${product.updatedAt}`}
          title={`Editar producto: ${product.name}`}
          description="Edita los datos del producto. Si algo necesita correccion, lo marcamos en el mismo formulario."
          submitLabel="Guardar cambios"
          defaultValues={toProductFormValues(product)}
          showActiveField
          isSubmitting={updateMutation.isPending || archiveMutation.isPending}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync(toProductUpdateInput(values));
          }}
          footer={
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={!product.isActive || updateMutation.isPending || archiveMutation.isPending}
              onClick={() => {
                if (!window.confirm(`Archivar ${product.name}? El registro quedara inactivo.`)) return;
                archiveMutation.mutate();
              }}
            >
              {archiveMutation.isPending ? 'Archivando...' : product.isActive ? 'Archivar producto' : 'Producto archivado'}
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Detalle rapido</CardTitle>
            <CardDescription>Informacion sincronizada con el backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <PencilLine className="h-4 w-4" />
                Identificacion
              </div>
              <div className="font-medium text-slate-900">{product.code || 'Sin codigo'}</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <BadgeCheck className="h-4 w-4" />
                Precio de referencia
              </div>
              <div className="font-medium text-slate-900">{formatProductPrice(product.referencePrice)}</div>
            </div>
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Ultima actualizacion
              </div>
              <div className="font-medium text-slate-900">{formatDate(product.updatedAt)}</div>
            </div>

            {archiveMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                {getArchiveErrorMessage(archiveMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
