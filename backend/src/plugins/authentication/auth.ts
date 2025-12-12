import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { FastifyRequest } from "fastify";

async function auth(fastify :FastifyInstance, opts: FastifyPluginOptions) {
	
	fastify.decorate('authorize', authorize)

	async function authorize (req: FastifyRequest) : Promise<boolean> {
		//replace of course
		console.log("authorize called")
		return true
	}
}

export default fp(auth, {
	name: 'auth',
});