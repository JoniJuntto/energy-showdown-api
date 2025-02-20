import { drinks_stats } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { FastifyInstance } from "fastify";
import { drinks } from "../db/schema";
import { db } from "../db";

export async function drinksRoutes(fastify: FastifyInstance) {
  fastify.get("/drinks/all", async (request, reply) => {
    console.log("GET /drinks/all");
    const allDrinks = await db.select().from(drinks);
    console.log(allDrinks);
    return reply.status(200).send(allDrinks);
  });

  fastify.get("/drinks/top", async (request, reply) => {
    console.log("GET /drinks/top");
    const topDrinks = await db
      .select({
        ean: drinks.ean,
        name: drinks.name,
        photo: drinks.photo,
        volume: drinks.volume,
        description_en: drinks.description_en,
        wins: drinks_stats.wins,
      })
      .from(drinks)
      .innerJoin(drinks_stats, eq(drinks.ean, drinks_stats.ean))
      .orderBy(desc(drinks_stats.wins))
      .limit(10);

    return reply.status(200).send(topDrinks);
  });
}
