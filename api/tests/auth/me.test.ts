import { eq } from 'drizzle-orm';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';
import { resetDb } from '../helpers/db.js';

const credentials = { email: 'ana@example.com', password: 'correct-horse-1' };
const signUpData = { ...credentials, name: 'Ana' };

// Arrange helper: a "browser" that has signed up and logged in
async function signUpAndLogIn() {
  const browser = request.agent(app);
  const res = await browser.post('/auth/signup').send(signUpData).expect(201);
  await browser.post('/auth/login').send(credentials).expect(200);
  return { browser, userId: res.body.id as string };
}

describe('GET /auth/me', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns 200 with the user when logged in', async () => {
    const { browser, userId } = await signUpAndLogIn();

    const res = await browser.get('/auth/me');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: userId,
      email: credentials.email,
      role: 'customer',
    });
  });

  it('returns 401 when there is no cookie', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });

  it('returns 401 (not 500) for a fake token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Cookie', 'access_token=not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });

  it('returns 401 when the user was deleted after logging in', async () => {
    const { browser, userId } = await signUpAndLogIn();
    await db.delete(users).where(eq(users.id, userId));

    const res = await browser.get('/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });
});
