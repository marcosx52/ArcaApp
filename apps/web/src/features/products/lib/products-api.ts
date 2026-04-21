import { apiClient } from '@/lib/api-client';
import type { ProductCreateInput, ProductRecord, ProductUpdateInput } from './products';

type ProductQueryParams = {
  q?: string;
  isActive?: boolean;
};

function toQueryString(params?: ProductQueryParams) {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (typeof params.isActive === 'boolean') searchParams.set('isActive', String(params.isActive));

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function listProducts(params?: ProductQueryParams) {
  return apiClient.get<ProductRecord[]>(`/products${toQueryString(params)}`);
}

export function getProduct(id: string) {
  return apiClient.get<ProductRecord>(`/products/${id}`);
}

export function createProduct(payload: ProductCreateInput) {
  return apiClient.post<ProductRecord>('/products', payload);
}

export function updateProduct(id: string, payload: ProductUpdateInput) {
  return apiClient.patch<ProductRecord>(`/products/${id}`, payload);
}

export function archiveProduct(id: string) {
  return apiClient.delete<ProductRecord>(`/products/${id}`);
}
