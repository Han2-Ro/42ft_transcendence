const id = 1;

async function AddUser(name, email, passwordHash) {
	const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
	id++;
	stmt.run(id, name, email, passwordHash);
	stmt.finalize();
}