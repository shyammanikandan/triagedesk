import { z } from 'zod';

import type { RequestHandler } from 'express';
import { signUpSchema } from './auth.schemas.js';
import { signUp } from './auth.service.js';

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
