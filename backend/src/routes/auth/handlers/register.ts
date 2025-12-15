import { FastifyRequest, FastifyReply } from "fastify";

export async function onRegisterAttempt (req :FastifyRequest, reply: FastifyReply) {
	const { email, password, username } = req.body as { email: string; password: string; username: string };
	if (!email || !password || !username) {
   		return reply.code(400).send({ error: "Email, password and username required." });
	}
	// Check if username / email already exists in DB
/*    	if (fastify.is_email_used(email)) {
	    return reply.code(400).send({ error: "Email already registered." });
	}
	if (fastify.is_username_used(username)) {
	    return reply.code(400).send({ error: "Username already taken." });
	} */
	// Hash password
	//const passwordHash = await app.bcrypt.hash(password);
	// Create user
	//var id = fastify.add_user(username, email, passwordHash)
	const id = 1;
	reply.send({ success: true, userId: id });
}
