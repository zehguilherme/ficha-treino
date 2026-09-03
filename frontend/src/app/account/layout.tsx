import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Minha Conta' };

const AccountLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => children;

export default AccountLayout;
