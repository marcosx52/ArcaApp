import { apiClient } from '@/lib/api-client';
import type { CompanyFormValues, CompanyReadinessResponse, CompanyRecord, CompanyUpdateInput } from './company';

export function listCompanies() {
  return apiClient.get<CompanyRecord[]>('/companies');
}

export function getCompany(id: string) {
  return apiClient.get<CompanyRecord>(`/companies/${id}`);
}

export function updateCompany(id: string, payload: CompanyUpdateInput) {
  return apiClient.patch<CompanyRecord>(`/companies/${id}`, payload);
}

export function getCompanyReadiness(id: string) {
  return apiClient.get<CompanyReadinessResponse>(`/companies/${id}/readiness`);
}

export type { CompanyFormValues, CompanyReadinessResponse, CompanyRecord, CompanyUpdateInput } from './company';

