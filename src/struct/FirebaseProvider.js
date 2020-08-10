/* eslint-disable eqeqeq */
const { Provider } = require('discord-akairo');
const firebase = require('firebase-admin');

class FirestoreProvider extends Provider {
	constructor(database) {
		super();
		this.database = database;
	}

	async init() {
		await this.database.get().then(snapshot => {
			snapshot.forEach(doc => {
				this.items.set(doc.id, doc.data());
			});
		});
	}

	/**
	 * @description - The get method to get saved values.
	 * @param {string} id - The id of the data group (user/guild).
	 * @param {string} key - The key to look for.
	 * @param {any} defaultValue - The default value in case if there are no saved values.
	 * @returns {any} - The value.
	 */
	get(id, key, defaultValue) {
		if (this.items.has(id)) {
			const value = this.items.get(id)[key];
			return value == null ? defaultValue : value;
		}
		return defaultValue;
	}

	/**
	 * @description - The set method to save values.
	 * @param {string} id - The id of the data group (user/guild).
	 * @param {string} key - The key where the data will be saved.
	 * @param {any} value - The value to save.
	 * @returns {any} - Success / fail message.
	 */
	set(id, key, value) {
		const data = this.items.get(id) || {};

		// Firebase does not support "undefined" as a value. So, we replace it with null here.
		if (value == undefined) value = null;
		if (typeof value == 'object') {
			for (const attr in value) {
				if (value[attr] == undefined) value[attr] = null;
			}
		}

		data[key] = value;
		this.items.set(id, data);
		return this.database.doc(id).set({ [key]: value }, { merge: true });
	}

	/**
	 * @description - The delete method to delete saved values.
	 * @param {string} id - The id of the data group.
	 * @param {string} key - The key to delete.
	 * @returns {any} - Success / fail message.
	 */
	delete(id, key) {
		const data = this.items.get(id) || {};
		delete data[key];
		return this.database.doc(id).set({ [key]: firebase.firestore.FieldValue.delete() }, { merge: true });
	}

	/**
	 * @description - Delete an entire data group.
	 * @param {string} id - The id of the data group (user/guild).
	 * @returns {any} - Success / fail message.
	 */
	clear(id) {
		this.items.delete(id);
		return this.database.doc(id).delete();
	}
}

module.exports = FirestoreProvider;
