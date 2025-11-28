import {DB} from '../../DB/connect.js';
import fp from 'fastify-plugin'

//replace
const users = [];

async function registration(fastify, opts) {

	fastify.decorate('register', register)

	async function register(req, reply) {
	const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return reply.code(400).send({ error: "Email, password and username required." });
    }

    // Check if user exists
	//replace
    const existing = users.find(u => u.email === email);
    if (existing) {
        return reply.code(400).send({ error: "Email already registered." });
    }

	const existing2 = users.find(u => u.username === username);
    if (existing2) {
        return reply.code(400).send({ error: "Username already taken." });
    }

    // Hash password
    const passwordHash = await app.bcrypt.hash(password);

    // Create user
    const user = {
        id: users.length + 1,
        email,
        username: username,
        passwordHash
    };

	//replace
    users.push(user);

    reply.send({ success: true, userId: user.id });
	
  };

}

  export default fp(registration, {
	// Protip: if you name your plugins, the stack trace in case of errors
	//         will be easier to read and other plugins can declare their dependency
	//         on this one. `fastify-autoload` will take care of loading the plugins
	//         in the correct order.
	name: 'registration'
  })