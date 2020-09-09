const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { parseTime } = require('../../util/util');

class RemoveCommand extends Command {
	constructor() {
		super('remove', {
			aliases: ['remove', 'rm', 'rem'],
			args: [
				{
					id: 'numbers',
					match: 'rest',
					type: (_, phrase) => {
						if (!phrase.length) return undefined;
						const numbers = [];
						phrase.split(' ').forEach(word => {
							const number = parseInt(word, 10);
							if (Number.isNaN(word)) return undefined;
							return numbers.push(number);
						});
						return numbers.sort((a, b) => b - a);
					},
					prompt: {
						start: 'Which song(s) should I remove?',
						retry: 'I didn\'t catch that number. Could you please repeat that again?'
					}
				}
			],
			category: 'music',
			description: {
				content: 'Remove one or more songs from the queue.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]} <num>\``, 'Remove a song from the queue.')
						.addField(
							`\`@Julis ${this.aliases[0]} <num1> <num2> ...\``, 'Remove multiple songs from the queue.'
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
	 * @param {Object} args - The args object.
	 * @param {Array<number>} args.numbers - The songs to remove.
	 * @returns {*}
	 */
	async exec(message, { numbers }) {
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to join a voice channel to remove songs from the queue!');
			return message.channel.send(embed);
		}

		const serverQueue = this.client.music.queues.get(message.guild.id);
		const current = await serverQueue.current();

		if (!current?.track) {
			embed.setDescription('I\'m not playing any music!');
			return message.channel.send(embed);
		}

		const trackList = await serverQueue.tracks();
		let totalSongs = trackList.length;
		const songs = [];
		let time = 0;

		for (let num of numbers) {
			if (num > totalSongs) num = totalSongs;
			const decoded = await this.client.music.decode(trackList[num - 1]);
			songs.push(`・[${decoded.title}](${decoded.uri}) [${parseTime(decoded.length)} long].`);
			time += decoded.length;
			await serverQueue.remove(trackList[num - 1]);
			totalSongs--;
		}

		const newLength = await serverQueue.tracks().then(tracks => tracks.length);
		embed.setDescription(
			`🗑 Removed ${numbers.length} song${numbers.length > 1 ? 's' : ''} [${parseTime(time)} long].\n` +
			`${songs.slice(0, 4).join('\n')}\n` +
			`${songs.length > 5 ? `...${songs.length - 5} more song${songs.length - 5 > 1 ? 's' : ''}` : ''}`
		);
		embed.setFooter(`🎶 Playing ${newLength + 1} song${newLength > 0 ? 's' : ''}.`);

		return message.channel.send(embed);
	}
}

module.exports = RemoveCommand;
