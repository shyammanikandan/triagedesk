export class EmailAlreadyTakenError extends Error {
  code = 'EMAIL_TAKEN';
  constructor() {
    super('email is already taken');
    this.name = 'EmailAlreadyTakenError';
  }
}
