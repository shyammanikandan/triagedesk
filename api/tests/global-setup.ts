import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

export default async function setup() {
  const url = process.env.DATABASE_URL;
  if (!url?.includes('_test')) {
    throw new Error(
      'Refusing to run tests: DATABASE_URL is not a test database',
    );
  }

  const pool = new pg.Pool({ connectionString: url });
  await migrate(drizzle({ client: pool }), { migrationsFolder: './drizzle' });
  await pool.end();
}
