import './globals.css';
import { AppProvider } from '@/providers/app-provider';

export const metadata = {
  title: 'Facturación ARCA Starter',
  description: 'Starter real del proyecto de facturación',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
