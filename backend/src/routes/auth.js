export default async function guest (fastify, opts) {
	//Add Security
	
	
	fastify.route({
		method: 'POST',
		path: '/register',
		handler: onRegisterAttempt
	  })

	async function onRegisterAttempt (req, reply) {
				
	
	}
	fastify.route({
		method: 'POST',
		path: '/login',
		handler: onLoginAttempt
	  })
	
	async function onLoginAttempt (req, reply) {
	
	}
}
