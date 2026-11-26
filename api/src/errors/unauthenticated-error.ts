import { AppError } from './app-error.js';

export class UnauthenticatedError extends AppError {
  constructor() {
    super(401, 'UNAUTHENTICATED', 'User is unauthenticated');
  }
}
