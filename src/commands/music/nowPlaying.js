const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { parseTime } = require('../../util/util');

class NowPlayingCommand extends Command {
	constructor() {
		super('now-playing', {
			aliases: ['now-playing', 'np'],
			category: 'music',
			description: {
				content: 'Shows the song that I\'m currently playing.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'See the song that I am currently playing.')
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

		// Get the music queue of the server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song.
		const current = await serverQueue.current();

		// If there is no song being played, inform that to the member.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// Decode the song.
		const song = await this.client.music.decode(current.track);

		// Get the progress out of 10.
		let progress = Math.round((current.position / song.length) * 10);

		// Solve the array index limitations.
		if (progress === 0) progress = 1;
		if (progress === 10) progress = 9;

		// Make a progress bar with the song url as the marker markdown links - [link text](link).
		let progressBar = ['['];
		for (let i = 0; i < 10; i++) {
			progressBar.push('▬');
			if (i === progress) progressBar.push(`](${song?.uri ?? 'https://youtube.com/'})`);
		}
		progressBar = progressBar.join('');

		if (serverQueue.player.paused) {
			// If the music is paused, add an indicator that the music is paused.
			embed.setDescription(`⏸ Paused:\n・[${song.title}](${song.uri})\n${progressBar}`);
		} else {
			// Else show the currently playing song's decoded info.
			embed.setDescription(`⏯ Now playing:\n・[${song.title}](${song.uri})\n${progressBar}`);
		}
		embed.setThumbnail(`https://i.ytimg.com/vi/${song.identifier}/hqdefault.jpg`);
		embed.setFooter(`🎵 ${parseTime(current.position, 2)} / ${parseTime(song.length, 2)}`);

		return message.channel.send(embed);
	}
}

module.exports = NowPlayingCommand;
