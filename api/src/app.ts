import express from 'express';
import { sql } from 'drizzle-orm';

import { db } from './db/index.js';
import { authRouter } from './auth/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export const app = express();

app.use(express.json());
app.use('/auth', authRouter);

app.get('/health', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: 'error', db: 'down' });
  }
});
app.use(notFoundHandler);

app.use(errorHandler);
