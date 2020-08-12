const { Listener } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const globalChat = require('../util/globalchat');

class MessageListener extends Listener {
	constructor() {
		super('message', {
			emitter: 'client',
			event: 'message'
		});
	}

	/**
	 * @param {Message} message - Message event.
	 */
	async exec(message) {
		if (message.author.bot) return undefined;

		const channels = this.client.gData.get('global', 'globalChat', []).map(e => e.channel);
		if (channels.includes(message.channel.id)) globalChat.parse(message, this.client);

		// Send the prefix if someone mentions the bot.
		const msg = message.content.trim();
		if (msg === `<@${this.client.user.id}>` || msg === `<@!${this.client.user.id}>`) {
			// Get the prefix from the database.
			const prefix = this.client.gData.get(message.guild, 'prefix', process.env.PREFIX);

			// Send the prefix.
			message.channel.send(
				`${this.client.prefName(message)}, ` +
				`My prefix ${message.guild ? `for **__${message.guild.name}__**` : ''} is **${prefix}**` +
				`\nOr you can mention me as ${this.client.user}.`
			).then(m => m.delete({ timeout: 15000 }).catch(e => console.log(e)));
		}

		// Whenever someone sends me a message, I will forward it to a dedicated channel.
		if (message.channel.type === 'dm' && this.client.channels.cache.has(process.env.DMLog)) {
			const ch = this.client.channels.cache.get(process.env.DMLog);
			const dm = new MessageEmbed();
			dm.setColor(process.env.COLOR)
				.setAuthor(`UserID - ${message.author.id}`)
				.setTimestamp();

			// In case someone sends an attachment. Helpful for feedbacks, etc [Not yet implemented].
			if (message.attachments.size > 0) {
				dm.setDescription(`This Message Contains ${message.attachments.size} Attachments!`);
				for (const attachment of message.attachments.array()) {
					dm.addField(
						`Attachment ${message.attachments.array().indexOf(attachment) + 1}`,
						attachment.attachment
					);
				}
			}

			// Create a webhook of the person for special effects.
			const UserHook = await ch.createWebhook(message.author.tag, {
				avatar: message.author.displayAvatarURL(),
				reason: '<--- Start of new DM --->'
			}).catch(e => console.log(e));

			await UserHook.send(message.content, dm);
			await UserHook.delete('<--- End of new DM --->'); // Delete the webhook after use.
		}
	}
}

module.exports = MessageListener;
