import fastifyBcrypt from "fastify-bcrypt";
import fastifyJwt from "fastify-jwt";
import Env from '@fastify/env'
import AutoLoad from '@fastify/autoload'
import { join } from 'desm'

export default async function app(fastify, opts) {
	await fastify.register(fastifyBcrypt, { saltWorkFactor: 12 });
	await fastify.register(fastifyJwt, { secret: "SUPER_SECRET_KEY" });
	
	await fastify.register(AutoLoad, {
		dir: join(import.meta.url, 'plugins'),
    	options: Object.assign({}, opts)
  	})

	await fastify.register(AutoLoad, {
    	dir: join(import.meta.url, 'routes'),
    	dirNameRoutePrefix: false,
    	options: Object.assign({}, opts)
  	})
}
  