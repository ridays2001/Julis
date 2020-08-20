const { Firebase } = require('firestore-db');
const { env } = process;

// Initialize a new database instance.
const db = new Firebase({
	projectId: env.FSPID,
	clientEmail: env.FSCEmail,
	privateKey: env.FSPKey
});

class Database {
	static get firestore() {
		return db.firestore();
	}
}

module.exports = Database;
