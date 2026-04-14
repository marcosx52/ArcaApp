import Link from 'next/link';
import { Building2, FileText, LayoutDashboard, Package, Receipt, ShieldCheck, Users } from 'lucide-react';

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/company', label: 'Empresa', icon: Building2 },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/invoices', label: 'Comprobantes', icon: FileText },
  { href: '/invoices/new', label: 'Nueva factura', icon: Receipt },
  { href: '/arca-config', label: 'Configuración ARCA', icon: ShieldCheck },
];

export function Sidebar() {
  return (
    <aside className="w-full lg:w-72">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Facturación ARCA</h2>
          <p className="text-sm text-slate-500">Starter real del proyecto</p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
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
