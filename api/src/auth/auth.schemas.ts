import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(8).max(128),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
