import { createSelectSchema } from 'drizzle-zod'
import { allGuesses, guessType } from '../../db/schema/schema'

export const guessTypeSchema = createSelectSchema(guessType)
export type GuessType = (typeof guessType.enumValues)[number]

export const guessViewRowSchema = createSelectSchema(allGuesses)
export type GuessViewRowType = typeof allGuesses.$inferSelect
