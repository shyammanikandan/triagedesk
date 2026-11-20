import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { EmailAlreadyTakenError } from './auth.errors.js';

type UserSelect = typeof users.$inferSelect;
type UserInsert = Omit<typeof users.$inferInsert, 'id' | 'createdAt'>;
export type PublicUser = Omit<UserSelect, 'passwordHashed'>;

export const findUserByEmail = async (
  email: string,
): Promise<UserSelect | undefined> => {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return rows[0];
};

const isUniqueViolation = (err: unknown, constraint: string): boolean => {
  if (typeof err === 'object' && err !== null && 'cause' in err) {
    if (
      typeof err.cause === 'object' &&
      err.cause !== null &&
      'code' in err.cause &&
      'constraint' in err.cause
    )
      return err.cause.code === '23505' && err.cause.constraint === constraint;
  }
  return false;
};

export const createUser = async (data: UserInsert): Promise<PublicUser> => {
  try {
    const [user] = await db.insert(users).values(data).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });
    return user;
  } catch (err) {
    if (isUniqueViolation(err, 'users_email_unique')) {
      throw new EmailAlreadyTakenError();
    }
    throw err;
  }
};
