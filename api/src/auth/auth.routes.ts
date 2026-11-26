import { Router } from 'express';

import { logInController, signUpController } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpController);
authRouter.post('/login', logInController);
