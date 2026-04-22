import { apiClient } from '@/lib/api-client';

export type DashboardOnboardingStatus =
  | 'DRAFT'
  | 'PENDING_TAX_SETUP'
  | 'READY_FOR_HOMOLOGATION'
  | 'READY_FOR_PRODUCTION'
  | 'SUSPENDED';

export type DashboardSummaryResponse = {
  success: boolean;
  data: {
    todayIssuedCount: number;
    todayTotalAmount: string;
    draftCount: number;
    failedCount: number;
    readiness: {
      onboardingStatus: DashboardOnboardingStatus;
      isReadyForHomologation: boolean;
      isReadyForProduction: boolean;
    };
  };
};

export function getDashboardSummary() {
  return apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
}
