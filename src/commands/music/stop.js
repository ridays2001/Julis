const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { musicExit } = require('../../util/util');

class StopCommand extends Command {
	constructor() {
		super('stop', {
			aliases: ['stop', 'leave'],
			category: 'music',
			channel: 'guild',
			description: {
				content: 'Stop playing songs and clear the queue.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {*}
	 */
	async exec(message) {
		// Check if the member is in a voice channel or not.
		if (!message.member.voice || !message.member.voice.channel) {
			return message.channel.send(
				`${this.client.prefName(message)}, You need to be in the music channel to stop the music!`
			);
		}

		// Stop the music gracefully.
		await musicExit(message.guild.id, this.client);
		return message.channel.send('⏹ Stopped playing.');
	}
}

module.exports = StopCommand;
