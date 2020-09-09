const { Listener } = require('discord-akairo');
const { MessageEmbed, Guild } = require('discord.js');
const logger = require('../util/logger');

class GuildDeleteListener extends Listener {
	constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete'
		});
	}

	/**
	 * @param {Guild} guild - The guild object.
	 */
	async exec(guild) {
		// Cache the guild owner.
		const guildOwner = await this.client.users.fetch(guild.ownerID);

		// Set the guild information into an embed.
		const deletedGuild = new MessageEmbed();
		deletedGuild.setAuthor(`${guild.name} [ ${guild.id} ]`, guild.iconURL())
			.setColor('RED')
			.setDescription(
				`There were **${guild.memberCount}** members and **${guild.channels.cache.size}** channels.`
			)
			.setFooter(`👑 ${guildOwner.tag} [ ${guild.ownerID} ]`, guildOwner.displayAvatarURL())
			.setTimestamp();

		// Log this information to the console in magenta color.
		logger.sub(`- | ${guild.name} [ ${guild.id} ] :: ${guildOwner.tag}`);

		// Send the embed to the client logs channel.
		return this.client.channels.cache.get(process.env.clientLog)?.send(deletedGuild);
	}
}

module.exports = GuildDeleteListener;
