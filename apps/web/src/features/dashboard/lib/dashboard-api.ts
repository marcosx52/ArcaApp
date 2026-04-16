import { apiClient } from '@/lib/api-client';

export type DashboardSummaryResponse = {
  success: boolean;
  data: {
    todayIssuedCount: number;
    todayTotalAmount: string;
    draftCount: number;
    failedCount: number;
    readiness: {
      onboardingStatus: string;
      isReadyForHomologation: boolean;
      isReadyForProduction: boolean;
    };
  };
};

export function getDashboardSummary() {
  return apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
}
