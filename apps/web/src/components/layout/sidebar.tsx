'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, FileText, LayoutDashboard, Package, Receipt, ShieldCheck, Users } from 'lucide-react';

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/company', label: 'Empresa', icon: Building2 },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/invoices', label: 'Comprobantes', icon: FileText },
  { href: '/invoices/new', label: 'Nueva factura', icon: Receipt },
  { href: '/arca-config', label: 'Configuracion ARCA', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-72">
      <div className="rounded-3xl border border-slate-200 bg-white/88 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/72">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Facturacion ARCA</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Operacion fiscal con un panel claro, elegante y nocturno</p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-sm dark:border-slate-700 dark:bg-slate-100 dark:text-slate-950'
                    : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900'
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
