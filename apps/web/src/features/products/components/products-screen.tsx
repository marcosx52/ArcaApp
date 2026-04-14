import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const products = [
  { id: '1', name: 'Servicio de diseño', type: 'Servicio', price: '$120.000' },
  { id: '2', name: 'Mantenimiento mensual', type: 'Servicio', price: '$85.000' },
  { id: '3', name: 'Producto demo', type: 'Producto', price: '$25.500' },
];

export function ProductsScreen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos</CardTitle>
        <CardDescription>Catálogo reutilizable</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Precio</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{product.type}</td>
                  <td className="p-3">{product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
