import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getAnalytics } from "../functions/analytics";

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get("/analytics", async (request: FastifyRequest, reply: FastifyReply) => {
    console.log("GET /analytics");
    const analytics = await getAnalytics();
    return reply.status(200).send(analytics);
  });
}
