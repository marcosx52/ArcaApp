'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, CalendarDays, PencilLine } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/feedback/status-badge';
import { mapError } from '@/lib/error-mapping';
import { getProduct, updateProduct } from '../lib/products-api';
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

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ['products', productId],
    queryFn: () => getProduct(productId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateProduct>[1]) => updateProduct(productId, values),
    onSuccess: async (updatedProduct) => {
      queryClient.setQueryData(['products', productId], updatedProduct);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

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
        <StatusBadge tone={product.isActive ? 'success' : 'danger'}>{product.isActive ? 'Activo' : 'Inactivo'}</StatusBadge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr]">
        <ProductForm
          title={`Editar producto: ${product.name}`}
          description="Cambios persistidos vía PATCH /products/:id."
          submitLabel="Guardar cambios"
          defaultValues={toProductFormValues(product)}
          showActiveField
          isSubmitting={updateMutation.isPending}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync(toProductUpdateInput(values));
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Detalle rápido</CardTitle>
            <CardDescription>Información sincronizada con el backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <PencilLine className="h-4 w-4" />
                Identificación
              </div>
              <div className="font-medium text-slate-900">{product.code || 'Sin código'}</div>
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
                Última actualización
              </div>
              <div className="font-medium text-slate-900">{formatDate(product.updatedAt)}</div>
            </div>

            {updateMutation.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{mapError(updateMutation.error)}</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
