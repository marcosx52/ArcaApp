'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from './app-shell';
import { EmptyState } from '@/components/feedback/empty-state';
import { LoadingState } from '@/components/feedback/loading-state';
import {
  ACTIVE_COMPANY_CHANGE_EVENT,
  clearSession,
  getActiveCompanyId,
  getAuthToken,
  setActiveCompanyId,
} from '@/lib/auth';
import { getSession } from '@/lib/session';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getAuthToken();
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getSession,
    enabled: Boolean(token),
    retry: 0,
  });

  useEffect(() => {
    setActiveCompanyIdState(getActiveCompanyId());

    function syncCompany() {
      setActiveCompanyIdState(getActiveCompanyId());
    }

    window.addEventListener(ACTIVE_COMPANY_CHANGE_EVENT, syncCompany as EventListener);
    window.addEventListener('storage', syncCompany);

    return () => {
      window.removeEventListener(ACTIVE_COMPANY_CHANGE_EVENT, syncCompany as EventListener);
      window.removeEventListener('storage', syncCompany);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [router, token]);

  useEffect(() => {
    if (!sessionQuery.data?.data || activeCompanyId) return;

    const companies = sessionQuery.data.data.companies ?? [];
    const defaultCompanyId =
      companies.find((item) => item.isDefault)?.companyId ?? companies[0]?.companyId ?? null;

    if (defaultCompanyId) {
      setActiveCompanyId(defaultCompanyId);
      setActiveCompanyIdState(defaultCompanyId);
    }
  }, [activeCompanyId, sessionQuery.data]);

  useEffect(() => {
    if (!sessionQuery.isError) return;

    clearSession();
    router.replace('/login');
  }, [router, sessionQuery.isError]);

  if (!token) {
    return <LoadingState label="Redirigiendo al login..." />;
  }

  if (sessionQuery.isLoading) {
    return <LoadingState label="Validando sesión..." />;
  }

  if (sessionQuery.isError) {
    return <LoadingState label="Restableciendo sesión..." />;
  }

  const user = sessionQuery.data?.data;

  if (!user?.companies?.length) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <EmptyState
          title="No hay una empresa activa"
          description="La sesión existe, pero el usuario no tiene empresas asociadas para operar."
          actionHref="/login"
          actionLabel="Volver al login"
        />
      </div>
    );
  }

  if (!activeCompanyId) {
    return <LoadingState label="Preparando empresa activa..." />;
  }

  return <AppShell>{children}</AppShell>;
}
