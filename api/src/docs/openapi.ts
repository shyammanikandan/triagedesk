export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'TriageDesk API',
    version: '1.0.0',
    description:
      'Support desk API: customers raise tickets, agents resolve them.',
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'JWT set by POST /auth/login (httpOnly cookie).',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NOT_FOUND' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
            required: ['code', 'message'],
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Check the API and database are up',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API and database are healthy',
            content: {
              'application/json': {
                example: { status: 'ok', db: 'up' },
              },
            },
          },
          '503': {
            description: 'Database is unreachable',
            content: {
              'application/json': {
                example: { status: 'error', db: 'down' },
              },
            },
          },
        },
      },
    },
    '/auth/signup': {
      post: {
        summary: 'Create a customer account',
        description:
          'Creates a new user with the "customer" role. Any "role" field in the body is ignored. The email is trimmed and lowercased before saving.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100,
                    example: 'Ana García',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    maxLength: 254,
                    example: 'ana@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 8,
                    maxLength: 128,
                    example: 'supersecret1',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                example: {
                  id: '0b6c5a0e-7f3a-4c1e-9d2b-2f1e8a9c4d11',
                  name: 'Ana García',
                  email: 'ana@example.com',
                  role: 'customer',
                  createdAt: '2026-11-21T10:00:00.000Z',
                },
              },
            },
          },
          '400': {
            description:
              'Invalid input (validation failed, or the body is not valid JSON)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validations failed on one or more input fields',
                    details: {
                      formErrors: [],
                      fieldErrors: {
                        password: [
                          'Too small: expected string to have >=8 characters',
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Email is already registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: {
                    code: 'EMAIL_TAKEN',
                    message: 'Email is already taken',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in',
        description:
          'Checks email and password. On success, sets the JWT in an httpOnly `access_token` cookie (valid 1 day). The token is never returned in the body.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'ana@example.com',
                  },
                  password: { type: 'string', example: 'correct-horse-1' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logged in',
            headers: {
              'Set-Cookie': {
                description:
                  'access_token=<JWT>; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax (plus Secure in production)',
                schema: { type: 'string' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['customer', 'agent'] },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation failed (code: VALIDATION_ERROR)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description:
              'Wrong email or password (code: INVALID_CREDENTIALS). Same response for both, on purpose.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get the logged-in user',
        description:
          'Returns the user identified by the `access_token` cookie. Used by the frontend on page load to restore the session.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'The logged-in user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['customer', 'agent'] },
                  },
                },
              },
            },
          },
          '401': {
            description:
              'Not logged in, invalid or expired token, or the user no longer exists (code: UNAUTHENTICATED)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
