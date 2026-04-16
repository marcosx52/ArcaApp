'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { ACTIVE_COMPANY_CHANGE_EVENT, clearSession, getActiveCompanyId } from '@/lib/auth';
import { getSession } from '@/lib/session';

export function Topbar() {
  const router = useRouter();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getSession,
    retry: 0,
  });

  const user = sessionQuery.data?.data;

  useEffect(() => {
    setActiveCompanyId(getActiveCompanyId());

    function syncCompany() {
      setActiveCompanyId(getActiveCompanyId());
    }

    window.addEventListener(ACTIVE_COMPANY_CHANGE_EVENT, syncCompany as EventListener);
    window.addEventListener('storage', syncCompany);

    return () => {
      window.removeEventListener(ACTIVE_COMPANY_CHANGE_EVENT, syncCompany as EventListener);
      window.removeEventListener('storage', syncCompany);
    };
  }, []);

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/72 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Panel de facturacion</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Operacion diaria conectada con ARCA, ahora con tema claro y oscuro.
        </p>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <div className="font-medium text-slate-800 dark:text-slate-100">{user?.fullName ?? 'Sesion activa'}</div>
          <div>{user?.email ?? 'Usuario autenticado'}</div>
          <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Empresa activa: {activeCompanyId ?? 'sin definir'}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemeToggle />
          <Button variant="outline" type="button" onClick={handleLogout}>
            Cerrar sesion
          </Button>
        </div>
      </div>
    </div>
  );
}
