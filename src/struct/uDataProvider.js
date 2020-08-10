const { User } = require('discord.js');
const FirebaseProvider = require('./FirebaseProvider');

class Provider extends FirebaseProvider {
	constructor(database, {} = {}) {
		super(database);
	}

	/**
	 * @description - Get the saved data of a user.
	 * @param {User | string} user - The user id or the user object.
	 * @param {string} key - The key to look for.
	 * @param {any} defaultValue - The default value in case there are no saved values.
	 * @returns {any} - The value of the key.
	 */
	get(user, key, defaultValue) {
		const id = this.constructor.getUserID(user);
		return super.get(id, key, defaultValue);
	}

	/**
	 * @description - Save data for a user.
	 * @param {User | string} user - The user id or the user object.
	 * @param {string} key - The key where the data will be saved.
	 * @param {any} value - The data to save.
	 * @returns {any} - Success / fail message.
	 */
	set(user, key, value) {
		const id = this.constructor.getUserID(user);
		return super.set(id, key, value);
	}

	/**
	 * @description - Delete a key from a user's saved data.
	 * @param {User | string} user - The user id or the user object.
	 * @param {string} key - The key to delete.
	 * @returns {any} - Success / fail message.
	 */
	delete(user, key) {
		const id = this.constructor.getUserID(user);
		return super.delete(id, key);
	}

	/**
	 * @description - Delete all saved data of a user.
	 * @param {User | string} user - The user id or the user object.
	 * @returns {any} - Success / fail message.
	 */
	clear(user) {
		const id = this.constructor.getUserID(user);
		return super.clear(id);
	}

	/**
	 * @description - Get user id from input.
	 * @param {User | string} user - The user id or the user object.
	 * @returns {string} - The user id.
	 */
	static getUserID(user) {
		if (user instanceof User) return user.id;
		if (user === 'global' || !user) return 'global';
		if (typeof user === 'string' && /^\d+$/.test(user)) return user;
		throw new TypeError('Invalid user specified. Must be a User instance, user ID, "global", or null.');
	}
}

module.exports = Provider;
