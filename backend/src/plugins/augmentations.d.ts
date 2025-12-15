import { FastifyPluginAsync } from "fastify";

declare module 'fastify' {
	interface FastifyInstance {
		//plugin functions
		authorize: (req: FastifyRequest) => Promise<boolean>;
	}
}

declare const fastifyOurPlugins: FastifyPluginAsync;

export default fastifyOurPlugins;