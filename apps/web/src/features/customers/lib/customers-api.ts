import { apiClient } from '@/lib/api-client';
import type { CustomerCreateInput, CustomerRecord, CustomerUpdateInput } from './customers';

type CustomerQueryParams = {
  q?: string;
  isActive?: boolean;
};

function toQueryString(params?: CustomerQueryParams) {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (typeof params.isActive === 'boolean') searchParams.set('isActive', String(params.isActive));

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function listCustomers(params?: CustomerQueryParams) {
  return apiClient.get<CustomerRecord[]>(`/customers${toQueryString(params)}`);
}

export function getCustomer(id: string) {
  return apiClient.get<CustomerRecord>(`/customers/${id}`);
}

export function createCustomer(payload: CustomerCreateInput) {
  return apiClient.post<CustomerRecord>('/customers', payload);
}

export function updateCustomer(id: string, payload: CustomerUpdateInput) {
  return apiClient.patch<CustomerRecord>(`/customers/${id}`, payload);
}

export function archiveCustomer(id: string) {
  return apiClient.delete<CustomerRecord>(`/customers/${id}`);
}
