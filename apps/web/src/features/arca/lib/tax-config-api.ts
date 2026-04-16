import { apiClient } from '@/lib/api-client';
import type { TaxConfigReadinessPayload, TaxConfigRecord, TaxConfigUpsertInput } from './tax-config';

function companyTaxConfigPath(companyId: string) {
  return `/companies/${companyId}/tax-config`;
}

function readinessPath(companyId: string) {
  return `${companyTaxConfigPath(companyId)}/readiness`;
}

function legacyReadinessPath(companyId: string) {
  return `${companyTaxConfigPath(companyId)}/readiness-check`;
}

type ReadinessEnvelope = {
  success?: boolean;
  data?: TaxConfigReadinessPayload;
};

function normalizeReadinessResponse(
  response: ReadinessEnvelope | TaxConfigReadinessPayload,
): TaxConfigReadinessPayload {
  if ('data' in response && response.data) return response.data;
  return response as TaxConfigReadinessPayload;
}

export function listTaxConfigs(companyId: string) {
  return apiClient.get<TaxConfigRecord[]>(companyTaxConfigPath(companyId));
}

export function upsertTaxConfig(companyId: string, payload: TaxConfigUpsertInput) {
  return apiClient.put<TaxConfigRecord>(companyTaxConfigPath(companyId), payload);
}

export async function getTaxConfigReadiness(companyId: string) {
  try {
    const response = await apiClient.get<ReadinessEnvelope | TaxConfigReadinessPayload>(readinessPath(companyId));
    return normalizeReadinessResponse(response);
  } catch {
    const fallback = await apiClient.get<ReadinessEnvelope | TaxConfigReadinessPayload>(legacyReadinessPath(companyId));
    return normalizeReadinessResponse(fallback);
  }
}

