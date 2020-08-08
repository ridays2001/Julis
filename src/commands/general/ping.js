const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping', 'beep'],
			category: 'general',
			description: {
				content: 'Pings to the server to check latency.',
				guide: message => {
					// This sends a guide message for the commands. [Not yet implemented].
					const guide = new MessageEmbed();
					guide.setColor(process.env.COLOR)
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'To get my ping speed from the server.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 */
	async exec(message) {
		// The client speed is calculated by measuring the time in which the message is sent from client to the server.
		const m = await message.util.send('Pinging to the server...');

		// Time required for the bot to connect to the server.
		const clientSpeed = (m.editedTimestamp || m.createdTimestamp) -
		(message.editedTimestamp || message.createdTimestamp);

		// Time required for the server to respond.
		const pingSpeed = Math.round(this.client.ws.ping);

		// Edit the message to inform about the speed.
		return m.edit(
			`${message.util.parsed.alias === 'beep' ? 'Boop!' : 'Pong!'}\n` +
			`I need __**${clientSpeed}ms**__ to respond.\nThe server needs __**${pingSpeed}ms**__ to respond.`
		).catch(() => undefined); // Catch errors if the message is deleted before the bot edits it.
	}
}

module.exports = PingCommand;
