const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { parseTime } = require('../../util/util');

class PauseCommand extends Command {
	constructor() {
		super('pause', {
			aliases: ['pause'],
			category: 'music',
			description: {
				content: 'Pause the currently playing song.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Pause the currently playing song.')
						.setTimestamp();
					return guide;
				}
			},
			channel: 'guild'
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {*}
	 */
	async exec(message) {
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		// Check if the member is in the voice channel or not.
		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to be present in the music channel to pausing the music!');
			return message.channel.send(embed);
		}

		// Get the music queue for this server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song.
		const current = await serverQueue.current();

		// Don't do anything if no songs are being played.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// Don't do anything if the music is already paused.
		if (serverQueue.player.paused || !serverQueue.player.playing) {
			embed.setDescription('The music is already paused!');
			return message.channel.send(embed);
		}

		// Pause the music.
		await serverQueue.player.pause();

		// Decode the currently playing song and put it into an embed.
		const song = await this.client.music.decode(current.track);
		embed.setDescription(
			`Paused: [${song.title}](${song.uri})\n[${parseTime(current.position, 2)} / ${parseTime(song.length, 2)}]`
		);
		embed.setFooter('⏸ Paused music.');
		return message.channel.send(embed);
	}
}

module.exports = PauseCommand;
