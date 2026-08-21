export const getExercisePreview = (
  exerciseNames: string[],
): { names: string[]; remaining: number } => {
  const names = exerciseNames.slice(0, exerciseNames.length > 4 ? 3 : 4);
  return { names, remaining: exerciseNames.length - names.length };
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
