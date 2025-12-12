import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { FastifyRequest, FastifyReply } from "fastify";
import { onLoginAttempt } from "./handlers/login.js";
import { onRegisterAttempt } from "./handlers/register.js";

export default async function auth(fastify :FastifyInstance, opts: FastifyPluginOptions) {	
	
	//Add Security

	fastify.route({
		method: 'POST',
		url: '/register',
		handler: onRegisterAttempt
	  })

	fastify.route({
		method: 'POST',
		url: '/login',
		handler: onLoginAttempt
	  })
}
