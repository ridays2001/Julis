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
						// If there is no input, prompt the user to ask for it.
						if (!phrase.length) return undefined;

						// We will use an array of numbers to make our lives easier.
						const numbers = [];

						// Split the input and fill the number array.
						phrase.split(' ').forEach(word => {
							// Parse the number string to a number.
							const number = parseInt(word, 10);

							// If it's not a number, don't push it to the number array.
							if (Number.isNaN(word)) return undefined;

							// Push the number to the number array.
							return numbers.push(number);
						});

						// Sort the number array in descending order. [Refer to L#108 onwards]
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

		// If member is not in the voice channel, don't do anything.
		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to join a voice channel to remove songs from the queue!');
			return message.channel.send(embed);
		}

		// Get the music queue for the server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song for the server.
		const current = await serverQueue.current();

		// You cannot remove a song from the queue if there are no songs currently playing.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music!');
			return message.channel.send(embed);
		}

		const trackList = await serverQueue.tracks();

		// We save the total length of songs to avoid any lags in the music server from impacting our program.
		let totalSongs = trackList.length;
		const songs = [];
		let time = 0;

		// You cannot remove a song from the queue if the queue is empty.
		if (totalSongs < 1) {
			embed.setDescription('There are no songs in the music queue!');
			return message.channel.send(embed);
		}

		// Iterate over the input numbers and remove the songs at those numbers from the queue.
		for (let num of numbers) {
			/*
			 * This is where the descending order of number array is put into work.
			 * If the number is greater than the total number of songs, then replace it with the last possible number.
			 * If we don't arrange the input in descending order, then the last number changes in every iteration.
			 * If you don't understand the logic, try removing the array.sort() line at L#33.
			 */
			if (num > totalSongs) num = totalSongs;

			// Decode the song about to be removed.
			const decoded = await this.client.music.decode(trackList[num - 1]);

			// Push the decoded information to an array to store for later.
			songs.push(`・[${decoded.title}](${decoded.uri}) [${parseTime(decoded.length)} long].`);

			// Calculate the total time removed.
			time += decoded.length;

			// Remove the song from the queue.
			await serverQueue.remove(trackList[num - 1]);

			// Decrease the total number of songs.
			totalSongs--;
		}

		// New queue length.
		const newLength = await serverQueue.tracks().then(tracks => tracks.length);
		embed.setDescription(
			`🗑 Removed ${numbers.length} song${numbers.length > 1 ? 's' : ''} [${parseTime(time)} long].\n` +
			`${songs.slice(0, 4).join('\n')}\n` +
			`${songs.length > 5 ? `...${songs.length - 5} more song${songs.length - 5 > 1 ? 's' : ''}` : ''}`
		);
		embed.setFooter(`🎶 Playing ${newLength + 1} song${newLength > 0 ? 's' : ''}.`);

		// Send the embed and end the program.
		return message.channel.send(embed);
	}
}

module.exports = RemoveCommand;
