import type { Metadata } from 'next';
import { DAY_NAMES, getWeekDayFromSlug } from '@/lib/weekDays';

type WorkoutLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ weekDay: string }>;
};

export const generateMetadata = async ({
  params,
}: Pick<WorkoutLayoutProps, 'params'>): Promise<Metadata> => {
  const { weekDay } = await params;
  const resolvedWeekDay = getWeekDayFromSlug(weekDay);
  return {
    title: resolvedWeekDay ? DAY_NAMES[resolvedWeekDay] : 'Treino não encontrado',
    robots: { index: false, follow: false },
  };
};

const WorkoutLayout = ({ children }: WorkoutLayoutProps): React.ReactNode => children;

export default WorkoutLayout;
