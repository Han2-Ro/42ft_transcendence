import fastify from 'fastify';
import app from './app.js';

const server = fastify({ logger: true });

server.register(app);

server.listen({ port: 3000 }, err => {
  if (err) throw err;
});