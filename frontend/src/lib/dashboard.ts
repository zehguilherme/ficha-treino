export const getExercisePreview = (
  exerciseNames: string[],
): { names: string[]; remaining: number } => ({
  names: exerciseNames.slice(0, exerciseNames.length > 4 ? 3 : 4),
  remaining: Math.max(0, exerciseNames.length - 3),
});

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
