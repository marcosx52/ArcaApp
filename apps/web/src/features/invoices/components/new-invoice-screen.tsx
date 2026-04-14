import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewInvoiceScreen() {
  return (
    <div className="grid xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Nueva factura</CardTitle>
          <CardDescription>Pantalla principal del producto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input defaultValue="Factura C" />
            <Input defaultValue="Punto de venta 0003" />
            <Input defaultValue="Juan Pérez" />
            <Input defaultValue="12/04/2026" />
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 p-4">
            <div className="grid md:grid-cols-4 gap-3">
              <Input defaultValue="Servicio de diseño" className="md:col-span-2" />
              <Input defaultValue="1" />
              <Input defaultValue="$120.000" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Guardar borrador</Button>
            <Button>Emitir</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>$120.000</span></div>
            <div className="flex justify-between"><span>Impuestos</span><span>$0</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>$120.000</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validación previa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Empresa</span><span>OK</span></div>
            <div className="flex justify-between"><span>Cliente</span><span>OK</span></div>
            <div className="flex justify-between"><span>Punto de venta</span><span>OK</span></div>
            <div className="flex justify-between"><span>ARCA</span><span>Pendiente</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
