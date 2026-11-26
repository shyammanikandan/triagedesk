import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema.js';
import { config } from '../config.js';

const connectionString = config.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new pg.Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});
export const db = drizzle({ client: pool, schema });
