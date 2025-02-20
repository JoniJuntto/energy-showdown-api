import { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db";
import { drinks, drinks_stats, votes } from "../db/schema";
import fastifyCors from "@fastify/cors";
const VoteSchema = z.object({
  winner_ean: z.string(),
  loser_ean: z.string(),
  user_id: z.string(),
});

// Schemas for request validation
const UserParamsSchema = z.object({
  userId: z.string(),
});

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/votes", async (request, reply) => {
    const body = VoteSchema.parse(request.body);

    try {
      // Insert the vote
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        winner_ean: body.winner_ean,
        loser_ean: body.loser_ean,
        user_id: body.user_id,
      });

      // Update stats
      await db.transaction(async (tx) => {
        // Update winner stats
        await tx
          .insert(drinks_stats)
          .values({
            ean: body.winner_ean,
            wins: 1,
            losses: 0,
            total_votes: 1,
          })
          .onConflictDoUpdate({
            target: [drinks_stats.ean],
            set: {
              wins: sql`${drinks_stats.wins} + 1`,
              total_votes: sql`${drinks_stats.total_votes} + 1`,
            },
          });

        // Update loser stats
        await tx
          .insert(drinks_stats)
          .values({
            ean: body.loser_ean,
            wins: 0,
            losses: 1,
            total_votes: 1,
          })
          .onConflictDoUpdate({
            target: [drinks_stats.ean],
            set: {
              losses: sql`${drinks_stats.losses} + 1`,
              total_votes: sql`${drinks_stats.total_votes} + 1`,
            },
          });
      });

      return reply.status(201).send({ success: true });
    } catch (error) {
      console.error("Error recording vote:", error);
      return reply.status(500).send({ error: "Failed to record vote" });
    }
  });

  fastify.get("/users/:userId/stats", async (request, reply) => {
    const { userId } = UserParamsSchema.parse(request.params);

    try {
      const userVotes = await db
        .select({
          winner_ean: votes.winner_ean,
          loser_ean: votes.loser_ean,
          drink: {
            name: drinks.name,
            photo: drinks.photo,
            volume: drinks.volume,
            description_en: drinks.description_en,
          },
        })
        .from(votes)
        .innerJoin(drinks, eq(votes.winner_ean, drinks.ean))
        .where(eq(votes.user_id, userId));

      // Calculate stats from votes
      const drinkStats: { [key: string]: any } = {};

      for (const vote of userVotes) {
        // Handle winner
        if (!drinkStats[vote.winner_ean]) {
          drinkStats[vote.winner_ean] = {
            ean: vote.winner_ean,
            name: vote.drink.name,
            photo: vote.drink.photo,
            volume: vote.drink.volume,
            description_en: vote.drink.description_en,
            wins: 0,
            losses: 0,
          };
        }
        drinkStats[vote.winner_ean].wins++;

        // Handle loser
        if (!drinkStats[vote.loser_ean]) {
          const loserDrink = await db
            .select()
            .from(drinks)
            .where(eq(drinks.ean, vote.loser_ean))
            .then((rows) => rows[0]);

          drinkStats[vote.loser_ean] = {
            ean: vote.loser_ean,
            name: loserDrink?.name,
            photo: loserDrink?.photo,
            volume: loserDrink?.volume,
            description_en: loserDrink?.description_en,
            wins: 0,
            losses: 0,
          };
        }
        drinkStats[vote.loser_ean].losses++;
      }

      // Convert to array and sort by wins
      const statsArray = Object.values(drinkStats).sort(
        (a: any, b: any) => b.wins - a.wins
      );

      return reply.status(200).send(statsArray);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return reply.status(500).send({ error: "Failed to fetch user stats" });
    }
  });
}
