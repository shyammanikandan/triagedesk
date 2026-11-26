import { Router } from 'express';

import {
  logInController,
  meController,
  signUpController,
} from './auth.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const authRouter = Router();

authRouter.post('/signup', signUpController);
authRouter.post('/login', logInController);

authRouter.get('/me', requireAuth, meController);
