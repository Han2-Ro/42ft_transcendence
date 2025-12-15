import { FastifyInstance} from "fastify";
import { onLoginAttempt } from "./handlers/login.js";
import { onRegisterAttempt } from "./handlers/register.js";

export default async function auth(fastify :FastifyInstance) {	
	
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
