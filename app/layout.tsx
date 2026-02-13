import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'PagoPlux Integration Demo',
  description: 'Demostración de integración con PagoPlux/Paybox en Next.js',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
