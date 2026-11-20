import * as argon2 from 'argon2';

import { EmailAlreadyTakenError } from './auth.errors.js';
import type { SignUpInput } from './auth.schemas.js';
import {
  findUserByEmail,
  createUser,
  type PublicUser,
} from './auth.repository.js';

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
