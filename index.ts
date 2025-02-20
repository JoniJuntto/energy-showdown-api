import Fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { userRoutes } from "./routes/user";
import { drinksRoutes } from "./routes/drinks";

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(fastifyCors, {
  origin: "*",
});

fastify.register(drinksRoutes);
fastify.register(userRoutes);
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
