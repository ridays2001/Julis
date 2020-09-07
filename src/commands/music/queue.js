const { Command } = require('discord-akairo');
const { Message, MessageEmbed, MessageReaction, User } = require('discord.js');

const { paginate, parseTime } = require('../../util/util');

class QueueCommand extends Command {
	constructor() {
		super('queue', {
			aliases: ['queue', 'q'],
			category: 'music',
			description: {
				content: 'See the queued up songs.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'See the queued up songs.')
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

		// Get the music queue for the server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song for the server.
		let current = await serverQueue.current();

		// Don't do anything if there is no song being played.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// Set a random GIF thumbnail.
		const images = [
			'https://i.imgur.com/pjqi8vJ.gif',
			'https://i.imgur.com/ewFAAIn.gif',
			'https://i.imgur.com/e71Nez8.gif'
		];
		embed.setThumbnail(images[Math.floor(Math.random() * images.length)]);

		// Get the position of currently playing song.
		const pos = current.position;

		// eslint-disable-next-line require-atomic-updates
		current = await this.client.music.decode(current.track);

		// Get the music queue for the server.
		const tracks = await serverQueue.tracks();

		// Put the now playing info into human readable format.
		let np = `・[${current.title}](${current.uri})\n[ ${parseTime(pos, 2)} / ${parseTime(current.length, 2)} ].`;
		if (serverQueue.player.paused) np = `⏸ Paused:\n${np}\n\n`;
		else np = `🎵 Now playing:\n${np}\n\n`;

		// If the queue is empty, then end the program here.
		if (!tracks.length) {
			embed.setDescription(`${np}🎶 Empty Queue!`);
			embed.setFooter('🎵 Playing 1 song.');
			return message.channel.send(embed);
		}
		/**
		 * @description - All queue songs decoded and mapped to their info.
		 * @type {Array<string>}
		 */
		const songs = await this.client.music.decode(tracks).then(decoded => decoded.map(song => song.info));

		// The total queue time.
		const time = parseTime(songs.reduce((total, song) => total + song.length, 0));

		// Break down the long queue into different pages.
		const paginated = paginate(songs);

		// Map the first page.
		let paginatedSongs = paginated.items[0].map(song => {
			const index = `${songs.indexOf(song) + 1}`.padStart(4).padEnd(6);
			return `\`${index}\`・[${song.title}](${song.uri}) [${parseTime(song.length, 2)}].`;
		});

		embed.setDescription(`${np}🎶 Queued up:\n${paginatedSongs.join('\n')}`);
		embed.setFooter(`🎶 Playing ${tracks.length + 1} songs | ${time} long.`);

		// If there is only one page, then there's no need to proceed.
		if (paginated.pages === 1) return message.channel.send(embed);

		embed.setFooter(`${embed.footer.text} [Page 1 / ${paginated.pages}]`);

		const m = await message.channel.send(embed);

		// React with the Left arrow and Right arrow.
		await m.react('749472347341324310');
		await m.react('749472347332804610');

		// Keep record of the currently active page.
		let page = 0;

		try {
			await m.awaitReactions(
				/**
				 * @param {MessageReaction} r - The reaction.
				 * @param {User} u - The user.
				 * @returns {*} - The return value is not important for us here.
				 */
				async (r, u) => {
					// Remove the reaction for better UX.
					await r.users.remove(u);

					// If it is someone else who reacted, ignore it.
					if (u.id !== message.author.id) return undefined;

					/**
					 * If the user reacts with ➡ emoji, then add one page.
					 * If the user is at the last page and still reacts with ➡ emoji, then go back to page 0.
					 * If the user reacts with ⬅ emoji, then subtract one page.
					 * If the user is at the first page and still reacts with the ⬅ emoji, then go to last page.
					 * If it is something else, then ignore the reaction.
					 */
					if (r.emoji.id === '749472347332804610' && page !== (paginated.pages - 1)) page++;
					else if (r.emoji.id === '749472347332804610') page = 0;
					else if (r.emoji.id === '749472347341324310' && page !== 0) page--;
					else if (r.emoji.id === '749472347341324310') page = paginated.pages - 1;
					else return undefined;

					// Change the pages dynamically.
					paginatedSongs = paginated.items[page]
						.map(song => {
							const index = `${songs.indexOf(song) + 1}`.padStart(4).padEnd(6);
							return `\`${index}\`・[${song.title}](${song.uri}) [${parseTime(song.length, 2)}].`;
						});

					embed.setDescription(`${np}🎶 Queued up:\n${paginatedSongs.join('\n')}`);
					embed.setFooter(
						`🎶 Playing ${tracks.length + 1} songs | ${time} long. [Page ${page + 1} / ${paginated.pages}]`
					);

					return m.edit(embed);
				}, { time: 6e5, errors: ['time'] }
			);
		} catch {
			// Remove all reactions after a minute.
			return m.reactions.removeAll();
		}
		return undefined;
	}
}

module.exports = QueueCommand;
