import { apiClient } from '@/lib/api-client';
import type {
  CustomerOption,
  InvoiceCreateInput,
  InvoiceItemCreateInput,
  InvoiceItemUpdateInput,
  InvoiceIssueResult,
  InvoiceListFilters,
  InvoiceRecord,
  InvoiceUpdateInput,
  InvoiceValidation,
  ProductOption,
  SalesPointOption,
} from './invoices';

function toQueryString(filters?: InvoiceListFilters) {
  if (!filters) return '';

  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function listInvoices(filters?: InvoiceListFilters) {
  return apiClient.get<InvoiceRecord[]>(`/invoices${toQueryString(filters)}`);
}

export function getInvoice(id: string) {
  return apiClient.get<InvoiceRecord>(`/invoices/${id}`);
}

export function createInvoice(payload: InvoiceCreateInput) {
  return apiClient.post<InvoiceRecord>('/invoices', payload);
}

export function updateInvoice(id: string, payload: InvoiceUpdateInput) {
  return apiClient.patch<InvoiceRecord>(`/invoices/${id}`, payload);
}

export function addInvoiceItem(invoiceId: string, payload: InvoiceItemCreateInput) {
  return apiClient.post<InvoiceRecord>(`/invoices/${invoiceId}/items`, payload);
}

export function updateInvoiceItem(itemId: string, payload: InvoiceItemUpdateInput) {
  return apiClient.patch<InvoiceRecord>(`/invoices/items/${itemId}`, payload);
}

export function deleteInvoiceItem(itemId: string) {
  return apiClient.delete<{ success: boolean; message: string }>(`/invoices/items/${itemId}`);
}

export function validateInvoice(invoiceId: string) {
  return apiClient.post<InvoiceValidation>(`/invoices/${invoiceId}/validate`);
}

export function issueInvoice(invoiceId: string) {
  return apiClient.post<InvoiceIssueResult>(`/invoices/${invoiceId}/issue`, {
    forceRevalidation: true,
  });
}

export function createCreditNoteDraft(invoiceId: string) {
  return apiClient.post<InvoiceRecord>(`/invoices/${invoiceId}/create-credit-note-draft`);
}

export function listInvoiceCustomers() {
  return apiClient.get<CustomerOption[]>('/customers');
}

export function listInvoiceSalesPoints(companyId: string) {
  return apiClient.get<SalesPointOption[]>(`/companies/${companyId}/sales-points`);
}

export function listInvoiceProducts() {
  return apiClient.get<ProductOption[]>('/products');
}

