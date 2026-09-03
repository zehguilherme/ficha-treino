import type { Metadata } from 'next';

const DAY_NAMES: Record<string, string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

type WorkoutLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ weekDay: string }>;
};

export const generateMetadata = async ({
  params,
}: Pick<WorkoutLayoutProps, 'params'>): Promise<Metadata> => {
  const { weekDay } = await params;
  return {
    title: DAY_NAMES[weekDay] ?? 'Treino não encontrado',
    robots: { index: false, follow: false },
  };
};

const WorkoutLayout = ({ children }: WorkoutLayoutProps): React.ReactNode => children;

export default WorkoutLayout;
