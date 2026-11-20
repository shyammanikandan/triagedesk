import { sql } from 'drizzle-orm';
import { db } from '../../src/db/index.js';

export async function resetDb() {
  await db.execute(sql`TRUNCATE replies,users,tickets cascade`);
}
