import { AppError } from '../errors/app-error.js';

export class EmailAlreadyTakenError extends AppError {
  constructor() {
    super(409, 'EMAIL_TAKEN', 'email is already taken');
    this.name = 'EmailAlreadyTakenError';
  }
}
