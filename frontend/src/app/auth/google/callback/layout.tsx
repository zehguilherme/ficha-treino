import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticando',
  robots: { index: false, follow: false },
};

const GoogleCallbackLayout = ({ children }: { children: React.ReactNode }): React.ReactNode =>
  children;

export default GoogleCallbackLayout;
