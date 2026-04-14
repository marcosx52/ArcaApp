import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ArcaConfigScreen() {
  return (
    <div className="grid xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Configuración ARCA</CardTitle>
          <CardDescription>Readiness técnico y fiscal</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input defaultValue="TESTING" />
          <Input defaultValue="wsfev1" />
          <Input defaultValue="Punto de venta 0003" />
          <Input defaultValue="Certificado cargado" />
          <div className="md:col-span-2 flex gap-2">
            <Button>Probar conexión WSAA</Button>
            <Button variant="outline">Guardar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Readiness</CardTitle>
          <CardDescription>Estado del canal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Empresa</span><span>OK</span></div>
          <div className="flex justify-between"><span>Certificado</span><span>OK</span></div>
          <div className="flex justify-between"><span>WSAA</span><span>Pendiente</span></div>
          <div className="flex justify-between"><span>Producción</span><span>No lista</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
