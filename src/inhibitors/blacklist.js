const { Inhibitor } = require('discord-akairo');

class BlackListInhibitor extends Inhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		});
	}

	/**
	 * @description - This is the blacklist inhibitor. Return true to block people from using your bot.
	 * @param {Message} message - The message object.
	 * @returns {boolean} - The blacklist status.
	 */
	exec(message) {
		// Get the blacklist from the database.
		const blacklist = this.client.uData.get('global', 'blacklist', []);

		// If blacklist includes the user, block them.
		return blacklist.includes(message.author.id);
	}
}

module.exports = BlackListInhibitor;
