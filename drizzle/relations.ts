import { relations } from 'drizzle-orm/relations'
import { user, guesses, guessResolutions, account, session } from './schema'

export const guessesRelations = relations(guesses, ({ one, many }) => ({
  user: one(user, {
    fields: [guesses.userId],
    references: [user.id],
  }),
  guessResolutions: many(guessResolutions),
}))

export const userRelations = relations(user, ({ many }) => ({
  guesses: many(guesses),
  accounts: many(account),
  sessions: many(session),
}))

export const guessResolutionsRelations = relations(guessResolutions, ({ one }) => ({
  guess: one(guesses, {
    fields: [guessResolutions.guessId],
    references: [guesses.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))
