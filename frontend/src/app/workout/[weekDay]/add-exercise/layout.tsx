import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Adicionar exercício — Ficha de Treino' },
  robots: { index: false, follow: false },
};

const AddExerciseLayout = ({ children }: { children: React.ReactNode }): React.ReactNode =>
  children;

export default AddExerciseLayout;
