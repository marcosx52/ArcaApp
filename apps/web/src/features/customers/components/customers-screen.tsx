import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const customers = [
  { id: '1', name: 'Juan Pérez', doc: 'DNI 32555111', tax: 'Consumidor Final' },
  { id: '2', name: 'Ferretería San Martín', doc: 'CUIT 30-71234567-9', tax: 'Responsable Inscripto' },
  { id: '3', name: 'María Gómez', doc: 'CUIT 27-28888111-4', tax: 'Monotributista' },
];

export function CustomersScreen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Catálogo reutilizable para facturación</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Buscar cliente..." className="mb-4 max-w-sm" />
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Condición</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-200">
                  <td className="p-3 font-medium">{customer.name}</td>
                  <td className="p-3">{customer.doc}</td>
                  <td className="p-3">{customer.tax}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
