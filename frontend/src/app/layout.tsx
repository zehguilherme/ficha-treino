import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from '@/components/ui/Sonner';
import { QueryProvider } from '@/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fichatreino.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Ficha de Treino',
    title: 'Ficha de Treino — Seu treino organizado',
    description: 'Organize seus treinos, acompanhe seu progresso e evolua com consistência.',
  },
  twitter: { card: 'summary_large_image' },
  title: {
    default: 'Ficha de Treino — Seu treino organizado',
    template: '%s — Ficha de Treino',
  },
  description: 'Organize seus treinos, acompanhe seu progresso e evolua com consistência.',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
