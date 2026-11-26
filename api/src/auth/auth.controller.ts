import { z } from 'zod';

import type { RequestHandler } from 'express';
import { signUpSchema, logInSchema } from './auth.schemas.js';
import { logIn, signUp } from './auth.service.js';
import { TOKEN_TTL_MS } from './auth.token.js';
import { config } from '../config.js';

export const signUpController: RequestHandler = async (req, res) => {
  const result = signUpSchema.safeParse(req.body);

  if (!result.success) {
    const flat = z.flattenError(result.error);
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validations failed on one or more input fields',
        details: flat,
      },
    });
  }

  const newUser = await signUp(result.data);
  res.status(201).json(newUser);
};

export const logInController: RequestHandler = async (req, res) => {
  const result = logInSchema.safeParse(req.body);

  if (!result.success) {
    const flat = z.flattenError(result.error);
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validations failed on one or more input fields',
        details: flat,
      },
    });
  }

  const response = await logIn(result.data);

  res.cookie('access_token', response.token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production' ? true : false,
    sameSite: 'lax',
    maxAge: TOKEN_TTL_MS,
  });
  res.status(200).json(response.user);
};
