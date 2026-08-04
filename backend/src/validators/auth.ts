import { z } from 'zod';

export const googleAuthBodySchema = z.union([
  z.object({ token: z.string().min(1) }),
  z.object({ code: z.string().min(1) }),
]);

export type GoogleAuthBody = z.infer<typeof googleAuthBodySchema>;
