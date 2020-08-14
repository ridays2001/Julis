const { Command } = require('discord-akairo');
const { Message, MessageEmbed, GuildMember } = require('discord.js');

class ImitateCommand extends Command {
	constructor() {
		super('imitate', {
			aliases: ['imitate', 'im'],
			args: [
				{
					id: 'mem',
					type: 'member',
					default: message => message.member
				},
				{
					id: 'msg',
					match: 'rest',
					default: 'Hi'
				}
			],
			category: 'fun',
			description: {
				content: 'Send a message while imitating someone else.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				*/
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(
							`\`@Julis ${this.aliases[0]} <User> <Message>\``, 'Send a message while imitating the user.'
						)
						.setTimestamp();
					return guide;
				}
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_WEBHOOKS', 'MANAGE_MESSAGES']
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {GuildMember} args.mem - The member to imitate.
	 * @param {string} args.msg - The message to send.
	 */
	async exec(message, { mem, msg }) {
		// Create a Webhook with the member's display name and avatar image.
		const wb = await message.channel.createWebhook(mem.displayName, {
			avatar: mem.user.displayAvatarURL({ dynamic: true }),
			reason: `Imitate command by ${message.author.tag}.`
		}).catch(e => console.log(e));

		// Send the message with that webhook.
		await wb.send(msg);

		// Delete the original message after the webhook message is sent.
		await message.delete({ timeout: 1000, reason: '<--- IMITATE --->' });

		// Delete the webhook after use.
		await wb.delete('End of command.');
	}
}

module.exports = ImitateCommand;
