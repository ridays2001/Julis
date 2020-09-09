const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class VolumeCommand extends Command {
	constructor() {
		super('volume', {
			aliases: ['volume', 'vol'],
			args: [
				{
					id: 'vol',
					type: (_, phrase) => {
						if (!phrase) return undefined;

						const vol = parseInt(phrase, 10);
						if (!vol) return undefined;
						if (vol < 10) return 10;
						if (vol > 100) return 100;
						return vol;
					}
				}
			],
			category: 'music',
			description: {
				content: 'Set the volume of music.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`@Julis ${this.aliases[0]}`, 'Do something')
						.setTimestamp();
					return guide;
				}
			},
			channel: 'guild'
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {number} args.vol - The volume to set.
	 * @returns {*}
	 */
	async exec(message, { vol }) {
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to join the voice channel before adjusting the volume!');
			return message.channel.send(embed);
		}

		const serverQueue = this.client.music.queues.get(message.guild.id);
		await serverQueue.player.setVolume(vol);
		embed.setDescription(`Volume adjusted to **${vol}**.`);
		return message.channel.send(embed);
	}
}

module.exports = VolumeCommand;
