import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/feedback/status-badge';

const invoices = [
  { id: '1', date: '12/04/2026', code: '0003-00001245', customer: 'Juan Pérez', total: '$120.000', status: 'Emitida', arca: 'Aceptada' },
  { id: '2', date: '12/04/2026', code: '0003-00001246', customer: 'Ferretería San Martín', total: '$85.000', status: 'Emitida', arca: 'Aceptada' },
  { id: '3', date: '11/04/2026', code: 'BORRADOR', customer: 'María Gómez', total: '$25.500', status: 'Borrador', arca: 'No enviada' },
];

export function InvoicesScreen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprobantes</CardTitle>
        <CardDescription>Emitidos y borradores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Número</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3">ARCA</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-slate-200">
                  <td className="p-3">{invoice.date}</td>
                  <td className="p-3 font-medium">{invoice.code}</td>
                  <td className="p-3">{invoice.customer}</td>
                  <td className="p-3">{invoice.total}</td>
                  <td className="p-3">
                    <StatusBadge tone={invoice.status === 'Emitida' ? 'success' : 'warning'}>{invoice.status}</StatusBadge>
                  </td>
                  <td className="p-3">
                    <StatusBadge tone={invoice.arca === 'Aceptada' ? 'success' : 'default'}>{invoice.arca}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
