import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

async function actions(fastify :FastifyInstance, opts: FastifyPluginOptions){

	fastify.decorate('add_user', AddUser)
	
	let id = 1;
	async function AddUser(name: string, email: string, passwordHash: string) {
		const stmt = opts.db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
		id++;
		stmt.run(id, name, email, passwordHash, function (err: any) {
			if (err) {
				// handle/log error
				return;
			}
			stmt.finalize((finalizeErr: any) => {
				if (finalizeErr) {
					// handle/log finalize error
				}
			});
		});
		return id;
	}

	fastify.decorate('is_email_used', IsEmailUsed)

	async function IsEmailUsed(email : string)  {
  		const stmt = opts.db.prepare('SELECT * FROM users WHERE user_email = ?');
  		try {
    		const rows = await new Promise((resolve, reject) =>
      			stmt.all(email, (err : any, rows: any) => (err ? reject(err) : resolve(rows)))
    		);
    		stmt.finalize();
    		return Array.isArray(rows) && rows.length > 0;
		} catch (err) {
    		stmt.finalize();
    		// handle/log finalize error
  		}
	}

	fastify.decorate('is_username_used', IsUsernameUsed)

	async function IsUsernameUsed(name : string)  {
  		const stmt = opts.db.prepare('SELECT * FROM users WHERE user_name = ?');
  		try {
    		const rows = await new Promise((resolve, reject) =>
      			stmt.all(name, (err :any, rows:any) => (err ? reject(err) : resolve(rows)))
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