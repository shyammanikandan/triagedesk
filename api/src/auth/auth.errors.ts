import { AppError } from '../errors/app-error.js';

export class EmailAlreadyTakenError extends AppError {
  constructor() {
    super(409, 'EMAIL_TAKEN', 'Email is already taken');
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }
}
