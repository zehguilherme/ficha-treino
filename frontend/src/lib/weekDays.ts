import type { WeekDay } from '@/schemas/api';

export const DAY_NAMES: Record<WeekDay, string> = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

const WEEK_DAY_SLUGS: Record<WeekDay, string> = {
  DOMINGO: 'domingo',
  SEGUNDA: 'segunda',
  TERCA: 'terca',
  QUARTA: 'quarta',
  QUINTA: 'quinta',
  SEXTA: 'sexta',
  SABADO: 'sabado',
};

const WEEK_DAYS_BY_SLUG: Record<string, WeekDay> = Object.fromEntries(
  Object.entries(WEEK_DAY_SLUGS).map(([weekDay, slug]) => [slug, weekDay]),
) as Record<string, WeekDay>;

export const getWeekDaySlug = (weekDay: WeekDay): string => WEEK_DAY_SLUGS[weekDay];

export const getWeekDayFromSlug = (value: string | string[] | undefined): WeekDay | null => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate ? (WEEK_DAYS_BY_SLUG[candidate] ?? null) : null;
};
