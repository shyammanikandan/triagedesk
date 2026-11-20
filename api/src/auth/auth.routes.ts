import { Router } from 'express';

import { signUpController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpController);
