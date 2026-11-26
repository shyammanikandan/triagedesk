import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { app } from '../../src/app.js';
import { verifyToken } from '../../src/auth/auth.token.js';
import { resetDb } from '../helpers/db.js';

const credentials = { email: 'ana@example.com', password: 'correct-horse-1' };
const signUpData = { ...credentials, name: 'Ana' };

function getAccessTokenCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'];
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return cookies.find((c) => c.startsWith('access_token='));
}

describe('POST /auth/login', () => {
  let userId: string;

  beforeEach(async () => {
    await resetDb();
    const res = await request(app)
      .post('/auth/signup')
      .send(signUpData)
      .expect(201);
    userId = res.body.id;
  });

  it('returns 200 with the public user only', async () => {
    const res = await request(app).post('/auth/login').send(credentials);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: userId,
      email: credentials.email,
      role: 'customer',
    });
  });

  it('sets an httpOnly access_token cookie', async () => {
    const res = await request(app).post('/auth/login').send(credentials);
    const cookie = getAccessTokenCookie(res);

    expect(cookie).toBeDefined();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=86400');
    expect(cookie).not.toContain('Secure');
  });

  it('puts a valid token with sub and role in the cookie', async () => {
    const res = await request(app).post('/auth/login').send(credentials);
    const token =
      getAccessTokenCookie(res)?.split(';')[0]?.replace('access_token=', '') ??
      '';

    expect(verifyToken(token)).toMatchObject({ sub: userId, role: 'customer' });
  });

  it('returns 401 for a wrong password, with no cookie', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ ...credentials, password: 'wrong-password-1' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });
    expect(getAccessTokenCookie(res)).toBeUndefined();
  });

  it('gives an unknown email exactly the same response as a wrong password', async () => {
    const wrongPassword = await request(app)
      .post('/auth/login')
      .send({ ...credentials, password: 'wrong-password-1' });
    const unknownEmail = await request(app)
      .post('/auth/login')
      .send({ ...credentials, email: 'nobody@example.com' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it('returns 400 for an invalid body', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });
});
