const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { parseTime } = require('../../util/util');

class ResumeCommand extends Command {
	constructor() {
		super('resume', {
			aliases: ['resume'],
			category: 'music',
			description: {
				content: 'Resume the music.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Resume the music.')
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

		// Check if the member is in a voice channel or not.
		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to join the music channel first!');
			return message.channel.send(embed);
		}

		// Get the music queue for this server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing (paused) song.
		const current = await serverQueue.current();

		// If there is no song, then don't do anything.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// If the music player is not paused then don't do anything.
		if (!serverQueue.player.paused) {
			embed.setDescription('The music is not paused!');
			return message.channel.send(embed);
		}

		// If the bot is not in a music channel, then join the one in which the member is at.
		if (!message.guild.me.voice || !message.guild.me.voice.channel) {
			// These 2 lines are temporarily ones to prevent errors.
			if (!message.member.voice.channel.joinable) return undefined;
			if (!message.member.voice.channel.speakable) return undefined;

			await serverQueue.player.join(message.member.voice.channel.id);
		}

		// Resume the music.
		await serverQueue.player.pause(false);

		// Decode the song and put it into an embed.
		const song = await this.client.music.decode(current.track);
		embed.setDescription(
			`Resumed: [${song.title}](${song.uri})\n[${parseTime(current.position, 2)} / ${parseTime(song.length, 2)}]`
		);
		embed.setFooter('▶ Resumed music.');
		return message.channel.send(embed);
	}
}

module.exports = ResumeCommand;
