import { AppError } from './app-error.js';

export class ForbiddenError extends AppError {
  constructor() {
    super(
      403,
      'FORBIDDEN',
      'You do not have permission to perform this action',
    );
  }
}
