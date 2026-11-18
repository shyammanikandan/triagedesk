import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users } from '../db/schema.js';

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

export const createUser = async (data: UserInsert): Promise<PublicUser> => {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
  });
  return user;
};
