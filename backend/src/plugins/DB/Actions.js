import fp from "fastify-plugin";

const id = 1;

async function actions(fastify, opts){

	fastify.decorate('add_user', AddUser)

	async function AddUser(name, email, passwordHash) {
		const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
		id++;
		stmt.run(id, name, email, passwordHash);
		stmt.finalize();
	}
}

export default fp(actions, {
	name: 'DBActions',
	dependencies: ['DBConnector']
});