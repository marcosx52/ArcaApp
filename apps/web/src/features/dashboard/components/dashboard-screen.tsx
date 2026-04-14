import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function DashboardScreen() {
  const cards = [
    { title: 'Facturado hoy', value: '$205.000' },
    { title: 'Comprobantes emitidos', value: '12' },
    { title: 'Borradores', value: '3' },
    { title: 'Estado general', value: 'Operativo' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{item.title}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Resumen operativo del día</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Factura C emitida para Juan Pérez por $120.000',
              'Factura B emitida para Ferretería San Martín por $85.000',
              'Borrador guardado para María Gómez',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del canal</CardTitle>
            <CardDescription>Readiness resumido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Empresa</span><span>OK</span></div>
            <div className="flex justify-between"><span>Punto de venta</span><span>OK</span></div>
            <div className="flex justify-between"><span>WSAA</span><span>Pendiente</span></div>
            <div className="flex justify-between"><span>Producción</span><span>No lista</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
