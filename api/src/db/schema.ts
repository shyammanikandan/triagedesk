import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('ticket_priority', [
  'low',
  'medium',
  'high',
]);

export const statusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

export const roleEnum = pgEnum('user_role', ['customer', 'agent']);

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: priorityEnum('priority').notNull().default('low'),
    status: statusEnum('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    assignedTo: uuid('assigned_to').references(() => users.id, {
      onDelete: 'set null',
    }),
  },
  (table) => [
    index('tickets_assigned_to_idx').on(table.assignedTo), // agent's "assigned to me" list
    index('tickets_created_by_idx').on(table.createdBy), // customer's "my tickets" list
  ],
);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHashed: text('password_hashed').notNull(),
  role: roleEnum('role').notNull().default('customer'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const replies = pgTable(
  'replies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
  },
  (table) => [index('replies_ticket_id_idx').on(table.ticketId)], // a ticket's reply thread
);
