import { formatLabel } from '@/lib/utils';

export const EXERCISE_LABELS = {
  category: {
    alongamento: 'Alongamento',
    cardio: 'Cardio',
    forca: 'Força',
    'levantamento-olimpico': 'Levantamento olímpico',
    pliometria: 'Pliometria',
    powerlifting: 'Powerlifting',
    strongman: 'Strongman',
  },
  equipment: {
    barra: 'Barra',
    'barra-w': 'Barra W',
    'bola-de-exercicio': 'Bola de exercício',
    'bola-medicinal': 'Bola medicinal',
    cabo: 'Cabo',
    faixas: 'Faixas',
    halteres: 'Halteres',
    kettlebell: 'Kettlebell',
    maquina: 'Máquina',
    outros: 'Outros',
    'peso-do-corpo': 'Peso do corpo',
    'rolo-de-espuma': 'Rolo de espuma',
  },
  level: {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  },
  force: {
    push: 'Empurrar',
    static: 'Estático',
    pull: 'Puxar',
  },
  mechanic: {
    composto: 'Composto',
    isolado: 'Isolado',
  },
  muscle: {
    abdominais: 'Abdominais',
    abdutores: 'Abdutores',
    adutores: 'Adutores',
    antebracos: 'Antebraços',
    biceps: 'Bíceps',
    dorsais: 'Dorsais',
    gluteos: 'Glúteos',
    'inferior-das-costas': 'Inferior das costas',
    isquiotibiais: 'Isquiotibiais',
    'meio-das-costas': 'Meio das costas',
    ombros: 'Ombros',
    panturrilhas: 'Panturrilhas',
    peito: 'Peito',
    pescoco: 'Pescoço',
    quadriceps: 'Quadríceps',
    trapezio: 'Trapézio',
    triceps: 'Tríceps',
  },
} as const;

export type ExerciseLabelGroup = keyof typeof EXERCISE_LABELS;

export const getExerciseLabel = (group: ExerciseLabelGroup, value: string): string =>
  EXERCISE_LABELS[group][value as keyof (typeof EXERCISE_LABELS)[ExerciseLabelGroup]] ??
  formatLabel(value);
