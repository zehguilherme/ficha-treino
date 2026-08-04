import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Ficha de Treino',
};

const DashboardPage = () => {
  return (
    <main className="flex-1 px-4 py-8 bg-background">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </main>
  );
};

export default DashboardPage;
