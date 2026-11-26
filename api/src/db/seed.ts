import * as argon2 from 'argon2';
import { z } from 'zod';

import { db, pool } from './index.js';
import { users } from './schema.js';

// Only the seed needs these, so they're validated here, not in config.ts
const seedEnvSchema = z.object({
  SEED_AGENT_NAME: z.string().min(1),
  SEED_AGENT_EMAIL: z.email(),
  SEED_AGENT_PASSWORD: z.string().min(8),
});

async function main() {
  const env = seedEnvSchema.parse(process.env);
  const passwordHashed = await argon2.hash(env.SEED_AGENT_PASSWORD);

  const inserted = await db
    .insert(users)
    .values({
      name: env.SEED_AGENT_NAME,
      email: env.SEED_AGENT_EMAIL,
      passwordHashed,
      role: 'agent',
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (inserted.length > 0) {
    console.log(`Agent created: ${env.SEED_AGENT_EMAIL}`);
  } else {
    console.log(
      `Agent already exists: ${env.SEED_AGENT_EMAIL} (nothing changed)`,
    );
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
