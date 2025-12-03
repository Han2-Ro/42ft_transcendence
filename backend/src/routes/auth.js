export default async function auth(fastify, opts) {	
	
	//Add Security

	fastify.route({
		method: 'POST',
		path: '/register',
		handler: onRegisterAttempt
	  })

	async function onRegisterAttempt (req, reply) {
		const { email, password, username } = req.body;

    	if (!email || !password || !username) {
       		return reply.code(400).send({ error: "Email, password and username required." });
   		}
    	// Check if username / email already exists in DB
    	if (fastify.is_email_used(email)) {
    	    return reply.code(400).send({ error: "Email already registered." });
    	}
    	if (fastify.is_username_used(username)) {
    	    return reply.code(400).send({ error: "Username already taken." });
    	}
    	// Hash password
    	const passwordHash = await app.bcrypt.hash(password);
    	// Create user
		id = fastify.add_user(username, email, passwordHash)
    	reply.send({ success: true, userId: id });

	}
	fastify.route({
		method: 'POST',
		path: '/login',
		handler: onLoginAttempt
	  })
	
	async function onLoginAttempt (req, reply) {

	}
}
