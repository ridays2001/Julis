const { Guild } = require('discord.js');
const FirebaseProvider = require('./FirebaseProvider');

class Provider extends FirebaseProvider {
	constructor(database, {} = {}) {
		super(database);
	}

	/**
	 * @description - Get the saved data of a guild.
	 * @param {Guild | string} guild - The guild id or the guild object.
	 * @param {string} key - The key to look for.
	 * @param {any} defaultValue - The default value in case there are no saved values.
	 * @returns {any} - The value of the key.
	 */
	get(guild, key, defaultValue) {
		const id = this.constructor.getGuildID(guild);
		return super.get(id, key, defaultValue);
	}

	/**
	 * @description - Save data for a guild.
	 * @param {Guild | string} guild - The guild id or the guild object.
	 * @param {string} key - The key where the data will be saved.
	 * @param {any} value - The data to save.
	 * @returns {any} - Success / fail message.
	 */
	set(guild, key, value) {
		const id = this.constructor.getGuildID(guild);
		return super.set(id, key, value);
	}

	/**
	 * @description - Delete a key from a guild's saved data.
	 * @param {Guild | string} guild - The guild id or the guild object.
	 * @param {string} key - The key to delete.
	 * @returns {any} - Success / fail message.
	 */
	delete(guild, key) {
		const id = this.constructor.getGuildID(guild);
		return super.delete(id, key);
	}

	/**
	 * @description - Delete all saved data of a guild.
	 * @param {Guild | string} guild - The guild id or the guild object.
	 * @returns {any} - Success / fail message.
	 */
	clear(guild) {
		const id = this.constructor.getGuildID(guild);
		return super.clear(id);
	}

	/**
	 * @description - Get guild id from input.
	 * @param {Guild | string} guild - The guild id or the guild object.
	 * @returns {string} - The guild id.
	 */
	static getGuildID(guild) {
		if (guild instanceof Guild) return guild.id;
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		if (guild === 'global' || !guild) return 'global';
		throw new TypeError('Invalid guild specified. Must be a Guild instance or guild ID.');
	}
}

module.exports = Provider;
