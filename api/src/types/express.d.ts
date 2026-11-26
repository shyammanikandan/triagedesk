import type { TokenPayload } from '../auth/auth.token.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: TokenPayload['role'];
      };
    }
  }
}
