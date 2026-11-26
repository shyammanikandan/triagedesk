import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { signToken } from '../../src/auth/auth.token.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { requireAuth } from '../../src/middleware/require-auth.js';
import { requireRole } from '../../src/middleware/require-role.js';

// A throwaway app that exists only for these tests
const testApp = express();
testApp.use(cookieParser());
testApp.get('/agent-only', requireAuth, requireRole('agent'), (_req, res) => {
  res.status(200).json({ ok: true });
});
// Deliberately missing requireAuth, to test the fail-safe
testApp.get('/forgot-require-auth', requireRole('agent'), (_req, res) => {
  res.status(200).json({ ok: true });
});
testApp.use(errorHandler);

function cookieFor(role: 'agent' | 'customer') {
  return `access_token=${signToken({ sub: 'test-user-id', role })}`;
}

describe('requireRole', () => {
  it('lets an agent through', async () => {
    const res = await request(testApp)
      .get('/agent-only')
      .set('Cookie', cookieFor('agent'));

    expect(res.status).toBe(200);
  });

  it('returns 403 for a customer', async () => {
    const res = await request(testApp)
      .get('/agent-only')
      .set('Cookie', cookieFor('customer'));

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ error: { code: 'FORBIDDEN' } });
  });

  it('returns 401 when there is no cookie', async () => {
    const res = await request(testApp).get('/agent-only');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });

  it('fails safe with 401 if requireAuth was forgotten', async () => {
    const res = await request(testApp)
      .get('/forgot-require-auth')
      .set('Cookie', cookieFor('agent'));

    expect(res.status).toBe(401);
  });
});
