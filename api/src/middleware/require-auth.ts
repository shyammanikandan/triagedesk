import type { RequestHandler } from 'express';
import { UnauthenticatedError } from '../errors/unauthenticated-error.js';
import { verifyToken } from '../auth/auth.token.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies.access_token;
  if (typeof token !== 'string') {
    throw new UnauthenticatedError();
  }

  let result;
  try {
    result = verifyToken(token);
  } catch {
    throw new UnauthenticatedError();
  }

  const { sub: id, role } = result;
  req.user = { id, role };

  next();
};
