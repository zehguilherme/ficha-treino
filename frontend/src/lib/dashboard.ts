export const getExercisePreview = (
  exercises: Array<{ name: string; done: boolean }>,
): { exercises: Array<{ name: string; done: boolean }>; remaining: number } => {
  const visible = exercises.slice(0, 8);
  return { exercises: visible, remaining: exercises.length - visible.length };
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};
