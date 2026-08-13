import type { Metadata } from 'next';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = { title: 'Dashboard - Ficha de Treino' };

const DashboardPage = () => <DashboardClient />;

export default DashboardPage;
