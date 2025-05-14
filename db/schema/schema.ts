import { index, numeric, pgTable, pgView, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

import { eq, isNotNull, relations, sql } from 'drizzle-orm'
import { pgEnum } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export const guessType = pgEnum('guess_type', ['up', 'down'])

export const guesses = pgTable(
  'guesses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    guess: guessType('guess').notNull(),
    guessPrice: numeric('guess_price').notNull(),
    guessedAt: timestamp('guessed_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    startResolvingAt: timestamp('start_resolving_at'), // Lock the guess when resolution starts.
  },
  (table) => [index('user_id_idx').on(table.userId), index('guessed_at_idx').on(table.guessedAt)],
)

export const guessRelations = relations(guesses, ({ one }) => ({
  guessResolutions: one(guessResolutions),
}))

export const guessResolutions = pgTable(
  'guess_resolutions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    guessId: uuid('guess_id')
      .notNull()
      .references(() => guesses.id, { onDelete: 'cascade' }),
    resolvedPrice: numeric('resolved_price').notNull(),
    resolvedAt: timestamp('resolved_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('guess_id_idx').on(table.guessId), unique('guess_id_unique').on(table.guessId)],
)

export const resolvedGuesses = pgView('resolved_guesses').as((qb) =>
  qb
    .select({
      guessId: guesses.id,
      userId: guesses.userId,
      guess: guesses.guess,
      guessPrice: guesses.guessPrice,
      guessedAt: guesses.guessedAt,
      resolvedAt: guessResolutions.resolvedAt,
      resolvedPrice: guessResolutions.resolvedPrice,
      isCorrect:
        sql<boolean>`CASE WHEN (${guesses.guessPrice} < ${guessResolutions.resolvedPrice} AND ${guesses.guess} = 'up') OR (${guesses.guessPrice} > ${guessResolutions.resolvedPrice} AND ${guesses.guess} = 'down') THEN true ELSE false END`.as(
          'is_correct',
        ),
    })
    .from(guesses)
    .innerJoin(guessResolutions, eq(guesses.id, guessResolutions.guessId))
    .where(isNotNull(guessResolutions.resolvedAt)),
)

export const allGuesses = pgView('all_guesses').as((qb) =>
  qb
    .select({
      guessId: guesses.id,
      userId: guesses.userId,
      guess: guesses.guess,
      guessPrice: guesses.guessPrice,
      guessedAt: guesses.guessedAt,
      resolvedAt: resolvedGuesses.resolvedAt,
      resolvedPrice: resolvedGuesses.resolvedPrice,
      isCorrect: resolvedGuesses.isCorrect,
      startResolvingAt: guesses.startResolvingAt,
    })
    .from(guesses)
    .leftJoin(resolvedGuesses, eq(guesses.id, resolvedGuesses.guessId)),
)
