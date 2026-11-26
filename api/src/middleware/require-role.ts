import type { RequestHandler } from 'express';
import type { TokenPayload } from '../auth/auth.token.js';
import { ForbiddenError } from '../errors/forbidden-error.js';
import { UnauthenticatedError } from '../errors/unauthenticated-error.js';

type Role = TokenPayload['role'];

export const requireRole = (...allowedRoles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new UnauthenticatedError();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
};
