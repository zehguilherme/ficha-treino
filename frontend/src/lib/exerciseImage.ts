const CDN_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

export const getExerciseImageUrl = (exerciseId: string, index: 0 | 1): string =>
  `${CDN_BASE}/${exerciseId}/${index}.jpg`;
