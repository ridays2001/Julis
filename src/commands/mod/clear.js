const { Command } = require('discord-akairo');
const { Message, MessageEmbed, GuildMember } = require('discord.js');

class ClearCommand extends Command {
	constructor() {
		super('clear', {
			aliases: ['clear', 'purge', 'clr'],
			args: [
				{
					id: 'bot',
					flag: ['--bot', '--b'],
					match: 'flag',
					optional: true
				},
				{
					id: 'num',
					type: 'number',
					prompt: {
						start: 'How many messages do you want me to clear?',
						retry: 'I couldn\'t catch that. Can you say that amount again?',
						cancel: 'Okie. I will not clear any messages.',
						optional: false
					}
				},
				{
					id: 'author',
					type: 'member',
					prompt: {
						retry: 'I couldn\'t find that member. Can you say that name again?',
						cancel: 'Okie. I will not clear any messages.',
						optional: true
					}
				}
			],
			category: 'mod',
			description: {
				content: 'Delete multiple messages in bulk',
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(
							`\`@Julis ${this.aliases[0]} <number>\``,
							'Delete a large number of messages in bulk. [Number must be between 0 and 100].'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} <number> --bot\``,
							'Delete all messages sent by bots in last number of messages.' +
							' [Number must be between 0 and 100].'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} <number> @member\``,
							'Delete all messages sent by a member in last number of messages.' +
							'[Number must be between 0 and 100].'
						)
						.setTimestamp();
					return guide;
				}
			},
			channel: 'guild'
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {boolean} args.bot - Whether the author of the message would be a bot or not.
	 * @param {GuildMember} args.member - The author of messages.
	 * @param {number} args.num - The number of messages.
	 */
	async exec(message, { bot, author, num = 2 }) {
		// Delete the command message.
		await message.delete({ reason: 'Bulk delete command message' }).catch(e => undefined);

		// Check whether the bot can actually delete the messages or not.
		if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
			return message.channel.send(
				`${this.client.prefName(message)}, I don\'t have the \`MANAGE_MESSAGES\` permission to do that.`
			);
		}

		// Check whether the person requesting the bulk delete can delete the messages or not.
		if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
			return message.channel.send(
				`${this.client.prefName(message)}, You don\'t have the \`MANAGE_MESSAGES\` permission to do that.`
			);
		}

		let msg = '';

		// The bot cannot delete more than 100 messages at once. So, we check for that condition first.
		if (num > 100) {
			num = 100;
			msg += `${this.client.prefName(message)}, You cannot delete more than 100 messages at once.\n`;
		}

		// Fetch the messages.
		let msgs = await message.channel.messages.fetch({ limit: num });

		// Filter the messages according to the requirements and set the confirmation message.
		if (bot) {
			msgs = msgs.filter(m => m.author.bot);
			msg += `Deleted **${msgs.size}** messages in last ${num} messages sent by bots.`;
		} else if (author) {
			msgs = msgs.filter(m => m.author.id === author.id);
			msg += `Deleted **${msgs.size}** messages in last ${num} messages sent by ${author.displayName}.`;
		} else {
			msg += `Deleted ${msgs.size} messages.`;
		}

		// Delete the filtered messages.
		await message.channel.bulkDelete(msgs)
			.catch(console.log);

		// Send the confirmation message and then delete it after 5 seconds.
		return message.channel.send(msg).then(m => {
			m.delete({ timeout: 5e3, reason: 'Bulk delete confirmation' })
				.catch(console.log);
		});
	}
}

module.exports = ClearCommand;
