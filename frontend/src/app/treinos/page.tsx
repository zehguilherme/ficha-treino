import type { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Treinos',
  robots: { index: false, follow: false },
};

const DashboardPage = () => <DashboardClient />;

export default DashboardPage;
