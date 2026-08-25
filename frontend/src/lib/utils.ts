import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatLabel = (value: string): string =>
  value
    .replace(/[-_]/g, ' ')
    .replace(
      /(^|\s)(\p{L})/gu,
      (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase('pt-BR'),
    );
