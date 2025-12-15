import fp from "fastify-plugin";
import {FastifyInstance} from "fastify";
import { FastifyRequest } from "fastify";

async function auth(fastify :FastifyInstance) {
	
	fastify.decorate('authorize', authorize)

	async function authorize (req: FastifyRequest) : Promise<boolean> {
		//replace of course
		void req;
		console.log("authorize called")
		return true
	}
}

export default fp(auth, {
	name: 'auth',
});