const { Listener } = require('discord-akairo');
const { MessageEmbed, Guild } = require('discord.js');
const logger = require('../util/logger');

class GuildCreateListener extends Listener {
	constructor() {
		super('guildCreate', {
			event: 'guildCreate',
			emitter: 'client'
		});
	}

	/**
	 * @param {Guild} guild - The guild object.
	 */
	async exec(guild) {
		// Cache the guild owner.
		const guildOwner = await this.client.users.fetch(guild.ownerID);
		const { me } = guild;

		// Get the invite link of the server.
		let invite = undefined;
		if (me.permissions.has('MANAGE_GUILD')) {
			// If the bot has manage guild permission, she can see the invites and fetch a random invite from there.
			invite = await guild.fetchInvites().then(invites => invites.first()?.url);
			if (!invite) {
				// If there are no invites for the server, we create one.
				invite = await guild.channels.cache.filter(ch => ch.permissionsFor(me).has('CREATE_INSTANT_INVITE'))
					.first()?.createInvite({ maxAge: 0, reason: 'Safe keeping.' })
					?.then(inv => inv.url);
			}
		} else {
			// If manage guild permission is not available, we create a new invite link anyways.
			invite = await guild.channels.cache.filter(ch => ch.permissionsFor(me).has('CREATE_INSTANT_INVITE'))
				.first()?.createInvite({ maxAge: 0, reason: 'Safe keeping.' })
				?.then(inv => inv.url);
		}

		// Check audit logs and find out who invited the bot.
		let inviter = undefined;
		if (me.permissions.has('VIEW_AUDIT_LOG')) {
			const log = await guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD' }).then(logs => logs.entries.first());
			if (log.target.id === this.client.user.id) {
				inviter = `- Invited by ${log.executor.tag} [ ${log.executor.id} ]`;
			}
		}

		// Set the data we collected into an embed.
		const newGuild = new MessageEmbed();
		newGuild.setAuthor(`${guild.name} [ ${guild.id} ]`, guild.iconURL())
			.setColor('GREEN')
			.setDescription(
				`There are **${guild.memberCount}** members and **${guild.channels.cache.size}** channels.\n` +
				`${invite ? `[Invite Link ↗](${invite})` : 'Invite link not available.'}\n${inviter ?? ''}`
			)
			.setFooter(`👑 ${guildOwner.tag} [ ${guild.ownerID} ]`, guildOwner.displayAvatarURL())
			.setTimestamp();

		// Log this information to the console in green color.
		logger.add(`+ | ${guild.name} [ ${guild.id} ] :: ${guildOwner.tag} ${inviter ?? ''}`);

		// Send the embed to the client logs channel.
		return this.client.channels.cache.get(process.env.clientLog)?.send(newGuild) ?? undefined;
	}
}

module.exports = GuildCreateListener;
