import fp from "fastify-plugin";

const id = 1;

async function actions(fastify, opts){

	fastify.decorate('add_user', AddUser)

	async function AddUser(name, email, passwordHash) {
		const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
		id++;
		stmt.run(id, name, email, passwordHash, function (err) {
    		if (err) {
        		// handle/log error
        		return;
			}
    		stmt.finalize((finalizeErr) => {
        		if (finalizeErr) {
            		// handle/log finalize error
        		}
    		});
		});
		return id;
	}

	fastify.decorate('is_email_used', IsEmailUsed)

	async function IsEmailUsed(email)  {
  		const stmt = db.prepare('SELECT * FROM users WHERE user_email = ?');
  		try {
    		const rows = await new Promise((resolve, reject) =>
      			stmt.all(email, (err, rows) => (err ? reject(err) : resolve(rows)))
    		);
    		stmt.finalize();
    		return Array.isArray(rows) && rows.length > 0;
		} catch (err) {
    		stmt.finalize();
    		// handle/log finalize error
  		}
	}

	fastify.decorate('is_username_used', IsUsernameUsed)

	async function IsUsernameUsed(name)  {
  		const stmt = db.prepare('SELECT * FROM users WHERE user_name = ?');
  		try {
    		const rows = await new Promise((resolve, reject) =>
      			stmt.all(email, (err, rows) => (err ? reject(err) : resolve(rows)))
    		);
    		stmt.finalize();
    		return Array.isArray(rows) && rows.length > 0;
		} catch (err) {
    		stmt.finalize();
    		// handle/log finalize error
  		}
	}
}

export default fp(actions, {
	name: 'DBActions',
	dependencies: ['DBConnector']
});