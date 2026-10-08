import { jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import type { FullGameState, SavedGameMeta } from '../src/types.js';

export const gameSaves = pgTable('game_saves', {
  ownerHash: text('owner_hash').notNull(),
  slotKey: text('slot_key').notNull(),
  state: jsonb('state').$type<FullGameState>().notNull(),
  metadata: jsonb('metadata').$type<SavedGameMeta>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [primaryKey({ columns: [table.ownerHash, table.slotKey] })]);
