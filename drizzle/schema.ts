import {
  pgTable,
  text,
  timestamp,
  index,
  foreignKey,
  uuid,
  numeric,
  unique,
  boolean,
  pgView,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const guessType = pgEnum('guess_type', ['up', 'down'])

export const verification = pgTable('verification', {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
})

export const guesses = pgTable(
  'guesses',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text('user_id').notNull(),
    guess: guessType().notNull(),
    guessPrice: numeric('guess_price').notNull(),
    guessedAt: timestamp('guessed_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('user_id_idx').using('btree', table.userId.asc().nullsLast().op('text_ops')),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'guesses_user_id_user_id_fk',
    }),
  ],
)

export const guessResolutions = pgTable(
  'guess_resolutions',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    guessId: uuid('guess_id').notNull(),
    resolvedPrice: numeric('resolved_price').notNull(),
    resolvedAt: timestamp('resolved_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
  },
  (table) => [
    index('guess_id_idx').using('btree', table.guessId.asc().nullsLast().op('uuid_ops')),
    foreignKey({
      columns: [table.guessId],
      foreignColumns: [guesses.id],
      name: 'guess_resolutions_guess_id_guesses_id_fk',
    }),
  ],
)

export const user = pgTable(
  'user',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean('email_verified').notNull(),
    image: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
  },
  (table) => [unique('user_email_unique').on(table.email)],
)

export const account = pgTable(
  'account',
  {
    id: text().primaryKey().notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'string' }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'string' }),
    scope: text(),
    password: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'account_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const session = pgTable(
  'session',
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    token: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_user_id_user_id_fk',
    }).onDelete('cascade'),
    unique('session_token_unique').on(table.token),
  ],
)
export const resolvedGuesses = pgView('resolved_guesses', {
  id: uuid(),
  userId: text('user_id'),
  guess: guessType(),
  guessPrice: numeric('guess_price'),
  guessedAt: timestamp('guessed_at', { mode: 'string' }),
  resolvedAt: timestamp('resolved_at', { mode: 'string' }),
  resolvedPrice: numeric('resolved_price'),
  isCorrect: boolean('is_correct'),
}).as(
  sql`SELECT guesses.id, guesses.user_id, guesses.guess, guesses.guess_price, guesses.guessed_at, guess_resolutions.resolved_at, guess_resolutions.resolved_price, CASE WHEN guesses.guess_price < guess_resolutions.resolved_price AND guesses.guess = 'up'::guess_type OR guesses.guess_price > guess_resolutions.resolved_price AND guesses.guess = 'down'::guess_type THEN true ELSE false END AS is_correct FROM guesses JOIN guess_resolutions ON guesses.id = guess_resolutions.guess_id WHERE guess_resolutions.resolved_at IS NOT NULL`,
)

export const allGuesses = pgView('all_guesses', {
  id: uuid(),
  userId: text('user_id'),
  guess: guessType(),
  guessPrice: numeric('guess_price'),
  guessedAt: timestamp('guessed_at', { mode: 'string' }),
  resolvedAt: timestamp('resolved_at', { mode: 'string' }),
  resolvedPrice: numeric('resolved_price'),
  isCorrect: boolean('is_correct'),
}).as(
  sql`SELECT guesses.id, guesses.user_id, guesses.guess, guesses.guess_price, guesses.guessed_at, resolved_guesses.resolved_at, resolved_guesses.resolved_price, resolved_guesses.is_correct FROM guesses LEFT JOIN resolved_guesses ON guesses.id = resolved_guesses.id`,
)
