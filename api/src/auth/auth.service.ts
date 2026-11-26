import * as argon2 from 'argon2';

import {
  EmailAlreadyTakenError,
  InvalidCredentialsError,
} from './auth.errors.js';
import type { LogInInput, SignUpInput } from './auth.schemas.js';
import {
  findUserByEmail,
  createUser,
  type PublicUser,
} from './auth.repository.js';
import { signToken } from './auth.token.js';

const DUMMY_HASH = await argon2.hash('any-placeholder-text');

type LogInResult = {
  user: Pick<PublicUser, 'id' | 'email' | 'role'>;
  token: string;
};

export const signUp = async (input: SignUpInput): Promise<PublicUser> => {
  const row = await findUserByEmail(input.email);

  if (row) {
    throw new EmailAlreadyTakenError();
  }
  const { password, ...data } = input;
  const passwordHashed = await argon2.hash(password);

  const createdUser = await createUser({ ...data, passwordHashed });

  return createdUser;
};

export const logIn = async (input: LogInInput): Promise<LogInResult> => {
  const row = await findUserByEmail(input.email);

  if (!row) {
    await argon2.verify(DUMMY_HASH, input.password);
    throw new InvalidCredentialsError();
  }

  const { passwordHashed, id, email, role } = row;
  const valid = await argon2.verify(passwordHashed, input.password);
  if (!valid) throw new InvalidCredentialsError();

  const token = signToken({ sub: id, role });

  return {
    user: { id, email, role },
    token,
  };
};
