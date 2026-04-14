'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { setActiveCompanyId, setAuthToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: {
          accessToken: string;
          user?: {
            companies?: {
              companyId: string;
              role: string;
              isDefault: boolean;
            }[];
          };
        };
        message: string;
      }>('/auth/login', { email, password });

      if (!response?.data?.accessToken) {
        throw new Error('No se recibió accessToken');
      }

      const companies = response?.data?.user?.companies ?? [];
      const defaultCompany =
        companies.find((item) => item.isDefault)?.companyId ??
        companies[0]?.companyId ??
        null;

      setAuthToken(response.data.accessToken);

      if (defaultCompany) {
        setActiveCompanyId(defaultCompany);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ingresar</CardTitle>
          <CardDescription>Acceso al panel de facturación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
          <p className="text-sm text-slate-500">
            Este login ya guarda el token JWT y la empresa activa para proteger endpoints sensibles.
          </p>
          <Link href="/" className="text-sm text-slate-700 underline">
            Ir al panel
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
