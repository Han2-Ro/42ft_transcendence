import fastify from 'fastify';
import app from './app.js';


const start = async () => {
	const server = fastify({ logger: true });
	
	server.register(app);

  	try {
    	await server.listen({port: 3000});
  	} catch (err) {
    	console.log(err);
    	server.log.error(err);
		process.exit(1);
  	}
};

start();


