const { User, Guild, Message } = require('discord.js');
const { AkairoClient } = require('discord-akairo');

// This file has some quick access functions. Read the function documentation for more info.

module.exports = {
	/**
	 * @description Returns the preferred name for a user,
	 * @param {Message} msg - The message object,
	 * @param {boolean} ignoreNicknames - Whether to ignore nicknames or not.
	 * @param {AkairoClient} [client.uData] - Import uData from client.
	 * @returns {string} - The preferred name.
	 */
	prefName: (msg, ignoreNicknames, { uData }) => {
		// Preference level - database.nickname > guild.displayName > user.username
		const name = {
			nickname: uData.get(msg.author, 'nickname', undefined),
			displayName: msg.member?.displayName,
			username: msg.author.username
		};

		if (ignoreNicknames) return name.displayName ?? name.username;
		return name.nickname ?? name.displayName ?? name.username;
	},

	/**
	 * @description Returns the preferred color for an embed.
	 * @param {User} user - User object.
	 * @param {Guild} guild - Guild object.
	 * @param {AkairoClient} [client] - Client object.
	 * @returns {string} - Color.
	*/
	prefColor: (user, guild, client) => {
		// Preference level - exclusive user > strict guild > user > guild > default.
		const colors = {
			user: {
				color: client.uData.get(user, 'color', undefined),
				exclusive: client.uData.get(user, 'exclusive', undefined)
			},
			guild: {
				color: client.gData.get(guild, 'color', undefined),
				strict: client.gData.get(guild, 'strict', undefined)
			},
			def: process.env.COLOR
		};

		if (colors.user.exclusive) return colors.user.color ?? colors.def;
		if (colors.guild.strict) return colors.guild.color ?? colors.def;
		return colors.user.color ?? colors.guild.color ?? colors.def;
	}
};
