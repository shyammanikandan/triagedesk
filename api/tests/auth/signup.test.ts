import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import * as argon2 from 'argon2';

import { app } from '../../src/app.js';
import { resetDb } from '../helpers/db.js';
import { findUserByEmail } from '../../src/auth/auth.repository.js';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'supersecret1',
};

describe('POST /auth/signup', () => {
  beforeEach(async () => {
    await resetDb();
  });
  it('creates a customer returns 201 with details', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ ...validUser, email: 'Test@example.com   ' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    });
  });

  it('creates a customer, returns 201 but does not return the password', async () => {
    const res = await request(app).post('/auth/signup').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('passwordHashed');
    expect(res.body).not.toHaveProperty('password');
  });

  it('ignores role in the request and creates a customer', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ ...validUser, role: 'agent' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('customer');
    const user = await findUserByEmail('test@example.com');

    expect(user?.role).toEqual('customer');
  });

  it('returns 409 when email is already registered', async () => {
    const res1 = await request(app).post('/auth/signup').send(validUser);
    expect(res1.status).toBe(201);
    const res2 = await request(app).post('/auth/signup').send(validUser);

    expect(res2.status).toBe(409);
    expect(res2.body).toMatchObject({
      error: { code: 'EMAIL_TAKEN', message: expect.any(String) },
    });
  });
  it('returns 409 when email is already registered with different capitals', async () => {
    const res1 = await request(app)
      .post('/auth/signup')
      .send({ ...validUser, email: 'TEST@Example.com  ' });
    expect(res1.status).toBe(201);
    const res2 = await request(app).post('/auth/signup').send(validUser);

    expect(res2.status).toBe(409);
    expect(res2.body).toMatchObject({
      error: { code: 'EMAIL_TAKEN', message: expect.any(String) },
    });
  });

  it('returns 400 with an error for each invalid field', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        ...validUser,
        email: 'not-an-email',
        password: 'abc',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');

    expect(res.body.error).toHaveProperty('details.fieldErrors.email');
    expect(res.body.error).toHaveProperty('details.fieldErrors.password');
  });
  it('stores the password as an Argon2 hash', async () => {
    const res = await request(app).post('/auth/signup').send(validUser);

    expect(res.status).toBe(201);

    const user = await findUserByEmail('test@example.com');

    if (!user) throw new Error('User was not saved');
    expect(user.passwordHashed).toMatch(/^\$argon2id\$/);
    expect(await argon2.verify(user.passwordHashed, validUser.password)).toBe(
      true,
    );
  });

  it('creates a user and returns 409 for other user when both signup at the same time', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post('/auth/signup').send(validUser),
      request(app).post('/auth/signup').send(validUser),
    ]);

    const statuses = [res1.status, res2.status].sort((a, b) => a - b);

    expect(statuses).toEqual([201, 409]);

    const usersCount = await db.$count(users);
    expect(usersCount).toBe(1);
  });
});
