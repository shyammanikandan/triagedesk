import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { roleEnum } from '../db/schema.js';
import { config } from '../config.js';

export const TOKEN_TTL_SECONDS = 60 * 60 * 24;
export const TOKEN_TTL_MS = TOKEN_TTL_SECONDS * 1000;

const tokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(roleEnum.enumValues),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, {
    algorithms: ['HS256'],
  });
  return tokenPayloadSchema.parse(decoded);
}
