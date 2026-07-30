import 'dotenv/config';
import type { PrismaClient } from '@prisma/client';

interface Exercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const API_URL =
  'https://raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/main/exercises/exercises-ptbr-full-translation.json';
const BATCH_SIZE = 50;

type ExerciseRecord = Record<string, Omit<Exercise, 'id'>>;

async function fetchExercises(): Promise<Exercise[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Falha ao baixar dataset: ${response.status}`);
  }

  const data = (await response.json()) as ExerciseRecord;

  return Object.entries(data).map(([id, exercise]) => ({
    id,
    ...exercise,
  }));
}

function batchInsert<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }

  return batches;
}

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('↓ Baixando dataset...');
  const exercises = await fetchExercises();
  console.log(`✓ ${exercises.length} exercícios baixados`);

  console.log('↓ Inserindo/atualizando...');

  const batches = batchInsert(exercises, BATCH_SIZE);
  let inserted = 0;
  let updated = 0;

  for (const batch of batches) {
    const queries = batch.map((exercise) =>
      prisma.exercise.upsert({
        where: { id: exercise.id },
        create: exercise,
        update: exercise,
      }),
    );

    const results = (await prisma.$transaction(queries)) as Exercise[];

    for (const result of results) {
      if (result.createdAt === result.updatedAt) {
        inserted++;
      } else {
        updated++;
      }
    }
  }

  console.log(`    ${inserted}/${exercises.length}`);

  console.log('↓ Verificando exercícios removidos do dataset...');
  const dbIds = (await prisma.exercise.findMany({
    select: { id: true },
    where: { id: { notIn: exercises.map((e) => e.id) } },
  })) as { id: string }[];
  const removedIds = dbIds.map((e) => e.id);

  let removed = 0;

  if (removedIds.length > 0) {
    const result = (await prisma.exercise.deleteMany({
      where: {
        id: { in: removedIds },
        workoutExercises: { none: {} },
      },
    })) as { count: number };
    removed = result.count;
  }

  console.log('✓ Seed concluído:');
  console.log(`    Inseridos:   ${inserted}`);
  console.log(`    Atualizados: ${updated}`);
  console.log(`    Removidos:   ${removed}`);
}

if (!process.env.JEST_WORKER_ID) {
  (async () => {
    const { prisma } = await import('./db.js');

    await seed(prisma as PrismaClient);
  })()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro no seed:', error);
      process.exit(1);
    });
}
