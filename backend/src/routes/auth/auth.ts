import { onRegisterAttempt } from "./handlers/register.ts";
import { onLoginAttempt } from "./handlers/login.ts";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function auth(fastify :FastifyInstance, opts: FastifyPluginOptions) {	
	
	//Add Security

	fastify.route({
		method: 'POST',
		path: '/register',
		handler: onRegisterAttempt
	  })

	fastify.route({
		method: 'POST',
		path: '/login',
		handler: onLoginAttempt
	  })
}
