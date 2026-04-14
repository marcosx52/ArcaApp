import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CompanyScreen() {
  return (
    <div className="grid xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>Datos base del emisor</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input defaultValue="Empresa Demo SA" />
          <Input defaultValue="Demo Facturación" />
          <Input defaultValue="20-11111111-2" />
          <Input defaultValue="Responsable Inscripto" />
          <Input defaultValue="Villa Carlos Paz" />
          <Input defaultValue="admin@demo.com" />
          <div className="md:col-span-2 flex gap-2">
            <Button>Guardar</Button>
            <Button variant="outline">Ver readiness</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Estado general</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Onboarding</span><span>72%</span></div>
          <div className="flex justify-between"><span>Testing</span><span>Parcial</span></div>
          <div className="flex justify-between"><span>Producción</span><span>Pendiente</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
