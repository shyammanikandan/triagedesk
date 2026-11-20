import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp } from '../../src/auth/auth.service.js';

import * as authRepo from '../../src/auth/auth.repository.js';
import { EmailAlreadyTakenError } from '../../src/auth/auth.errors.js';

vi.mock('../../src/auth/auth.repository.js', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

describe('signUp (service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws EmailAlreadyTakenError and does not create a user when the email exists', async () => {
    vi.mocked(authRepo.findUserByEmail).mockResolvedValue({
      id: '3124843308',
      name: 'shyam',
      passwordHashed: 'fdewfhweof',
      email: 'test@example.com',
      role: 'customer',
      createdAt: new Date(),
    });

    await expect(
      signUp({
        password: '12345678',
        name: 'shyam',
        email: 'test@example.com',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyTakenError);
    expect(authRepo.createUser).not.toHaveBeenCalled();
  });
});
