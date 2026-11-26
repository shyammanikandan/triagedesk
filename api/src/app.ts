import express from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { openApiSpec } from './docs/openapi.js';
import { db } from './db/index.js';
import { authRouter } from './auth/auth.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export const app = express();

app.use(express.json());
app.use(cookieParser());
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

app.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(notFoundHandler);

app.use(errorHandler);
