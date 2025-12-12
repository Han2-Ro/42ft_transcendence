import fastifyBcrypt from "fastify-bcrypt";
import fastifyJwt from "@fastify/jwt";
import Env from '@fastify/env'
import AutoLoad from '@fastify/autoload';
import fastify from "fastify";
import blippPlugin from "fastify-blipp";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const startServer = async () => {
	const server = fastify({ logger: true });
	
	await server.register(fastifyBcrypt, { saltWorkFactor: 12 });
	await server.register(fastifyJwt, { secret: "SUPER_SECRET_KEY" });
	await server.register(blippPlugin);
	
	//autoload our plugins
	await server.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: {}
	})

	//autoload our routes ( max depth 1 so we can have seperated handlers in a subfolder not picked up by autoload)
	await server.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		dirNameRoutePrefix: false,
		options: {},
		maxDepth: 1
	})

	try {
    	await server.listen({port: 3000});
		server.blipp(); // prints out routes
  	} catch (err) {
    	console.log(err);
    	server.log.error(err);
		process.exit(1);
  	}
}

startServer();