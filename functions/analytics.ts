// src/api/analytics.ts
import { desc, sql } from "drizzle-orm";
import { db } from "../db";
import { drinks, drinks_stats, votes } from "../db/schema";

export async function getAnalytics() {
  const currentDate = new Date();
  const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

  const topDrinks = await db
    .select({
        name: drinks.name,
        total_votes: drinks_stats.total_votes,
        winrate: sql<number>`CAST(${drinks_stats.wins} AS FLOAT) / NULLIF(${drinks_stats.total_votes}, 0) * 100`,
        wins: drinks_stats.wins,
    })
    .from(drinks_stats)
    .innerJoin(drinks, sql`${drinks.ean} = ${drinks_stats.ean}`)
    .where(sql`${drinks_stats.total_votes} >= 10`)
    .orderBy(desc(sql`CAST(${drinks_stats.wins} AS FLOAT) / NULLIF(${drinks_stats.total_votes}, 0) * 100`))
    .limit(10);

  const votingTrends = await db
    .select({
      interval: sql<string>`DATE_TRUNC('hour', ${votes.created_at} AT TIME ZONE 'Europe/Helsinki')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .where(sql`${votes.created_at} >= ${lastMonth}`)
    .groupBy(sql`DATE_TRUNC('hour', ${votes.created_at} AT TIME ZONE 'Europe/Helsinki')`)
    .orderBy(sql`DATE_TRUNC('hour', ${votes.created_at} AT TIME ZONE 'Europe/Helsinki')`);

  const activeUsers = await db
    .select({
      user_id: votes.user_id,
      vote_count: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .groupBy(votes.user_id)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(5);


  const headToHead = await db
    .select({
      drink1: drinks.name,
      drink2: sql<string>`drinks_2.name`,
      matches: sql<number>`COUNT(*)`,
    })
    .from(votes)
    .innerJoin(drinks, sql`${drinks.ean} = ${votes.winner_ean}`)
    .innerJoin(
      sql`${drinks} as drinks_2`,
      sql`drinks_2.ean = ${votes.loser_ean}`
    )
    .groupBy(drinks.name, sql`drinks_2.name`)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  const recentVotes = await db
    .select({
      winner_name: drinks.name,
      loser_name: sql<string>`drinks_2.name`,
      created_at: votes.created_at,
    })
    .from(votes)
    .innerJoin(drinks, sql`${drinks.ean} = ${votes.winner_ean}`)
    .innerJoin(sql`${drinks} as drinks_2`, sql`drinks_2.ean = ${votes.loser_ean}`)
    .orderBy(desc(votes.created_at))
    .limit(10);

  return {
    topDrinks,
    votingTrends,
    activeUsers,
    headToHead,
    recentVotes,
    summary: {
      totalVotes: await db.select({ count: sql<number>`COUNT(*)` }).from(votes).then(res => res[0].count),
      totalDrinks: await db.select({ count: sql<number>`COUNT(*)` }).from(drinks).then(res => res[0].count),
      activeUsers: await db.select({ count: sql<number>`COUNT(DISTINCT ${votes.user_id})` }).from(votes).then(res => res[0].count),
    }
  };
}