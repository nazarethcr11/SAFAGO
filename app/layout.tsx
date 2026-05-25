import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAFAGO — Tu asistente de viajes inteligente',
  description:
    'Descubre destinos personalizados y encuentra los mejores vuelos con la ayuda de IA. Viaja smarter con SAFAGO.',
  keywords: 'viajes, vuelos, destinos, inteligencia artificial, chatbot, recomendaciones',
  authors: [{ name: 'SAFAGO' }],
  openGraph: {
    title: 'SAFAGO — Tu asistente de viajes inteligente',
    description: 'Descubre destinos personalizados y encuentra los mejores vuelos con IA.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-surface-900 text-surface-50 antialiased">{children}</body>
    </html>
  );
}
