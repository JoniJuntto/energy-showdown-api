import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
};

export const drinks = pgTable("drinks", {
  ean: text("ean").primaryKey().notNull(),
  name: text("name").notNull(),
  photo: text("photo"),
  volume: integer("volume"),
  description_en: text("description_en"),
  ...timestamps,
});

export const drinks_stats = pgTable("drinks_stats", {
  ean: text("ean")
    .primaryKey()
    .references(() => drinks.ean),
  total_votes: integer("total_votes").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  ...timestamps,
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey(),
  winner_ean: text("winner_ean")
    .references(() => drinks.ean)
    .notNull(),
  loser_ean: text("loser_ean")
    .references(() => drinks.ean)
    .notNull(),
  user_id: text("user_id").notNull(),
  ...timestamps,
});
