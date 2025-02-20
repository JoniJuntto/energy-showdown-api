import Fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import { userRoutes } from "./routes/user";
import { drinksRoutes } from "./routes/drinks";

const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(fastifyCors, {
  origin: "*",
});

fastify.register(drinksRoutes);
fastify.register(userRoutes);
fastify.listen({ host: host, port: port as number }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
