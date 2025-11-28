async function login(req, reply) {

}

export default fp(login, {
	// Protip: if you name your plugins, the stack trace in case of errors
	//         will be easier to read and other plugins can declare their dependency
	//         on this one. `fastify-autoload` will take care of loading the plugins
	//         in the correct order.
		name: 'registration'
})