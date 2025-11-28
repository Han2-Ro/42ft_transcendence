import sqlite3 from 'sqlite3';
const sql3 = sqlite3.verbose();

const DB = new sql3.Database('./users.db', sqlite3.OPEN_READWRITE, connected);

function connected(err){
	if(err){
		console.log(err.message);
		return
	}
	console.log('Connected to db');
}

let sql = `CREATE TABLE IF NOT EXISTS users(
	user_id INTEGER,
	user_name TEXT NOT NULL
	user_email TEXT NOT NULL
	user_password_hash TEXT NOT NULL
)`;

DB.run(sql, [], (err)=>{
	//callback
	if(err) {
		console.log('error creating users table');
		return;
	}
	console.log('created Table');
});

export {DB};