import { apiClient } from '@/lib/api-client';
import type { CustomerCreateInput, CustomerRecord, CustomerUpdateInput } from './customers';

function toQueryString(params?: { q?: string }) {
  if (!params?.q) return '';
  return `?q=${encodeURIComponent(params.q)}`;
}

export function listCustomers(params?: { q?: string }) {
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
