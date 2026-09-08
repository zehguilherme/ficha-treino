import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha Conta',
  robots: { index: false, follow: false },
};

const AccountLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => children;

export default AccountLayout;
