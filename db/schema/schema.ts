import { index, numeric, pgTable, pgView, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { eq, isNotNull, sql } from 'drizzle-orm'
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
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('user_id_idx').on(table.userId)],
)

export const guessResolutions = pgTable(
  'guess_resolutions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    guessId: uuid('guess_id')
      .notNull()
      .references(() => guesses.id),
    resolvedPrice: numeric('resolved_price').notNull(),
    resolvedAt: timestamp('resolved_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('guess_id_idx').on(table.guessId)],
)

export const resolvedGuesses = pgView('resolved_guesses').as((qb) =>
  qb
    .select({
      guessId: guesses.id,
      userId: guesses.userId,
      guess: guesses.guess,
      guessPrice: guesses.guessPrice,
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
