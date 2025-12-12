import { FastifyPlugin } from "fastify";

declare module 'fastify' {
	interface FastifyInstance {
		//plugin functions
		authorize: (req: FastifyRequest) => Promise<boolean>;
	}
}