import fp from "fastify-plugin";
import sqlite3 from 'sqlite3';

const sql3 = sqlite3.verbose();

async function dbConnector(fastify, options) {
  const db = new sql3.Database('./src/DB/users.db', sqlite3.OPEN_READWRITE);

  db.exec(`CREATE TABLE IF NOT EXISTS users(
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_password_hash TEXT NOT NULL
  )`);

  fastify.decorate("db", db);

  fastify.addHook("onClose", (fastify, done) => {
    db.close();
    done();
  });

  console.log("Database created successfully");
}

export default fp(dbConnector, {
	name: 'DBConnector'
});
