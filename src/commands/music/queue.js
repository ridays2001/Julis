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

		const serverQueue = this.client.music.queues.get(message.guild.id);
		let current = await serverQueue.current();

		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		const images = [
			'https://i.imgur.com/pjqi8vJ.gif',
			'https://i.imgur.com/ewFAAIn.gif',
			'https://i.imgur.com/e71Nez8.gif'
		];
		embed.setThumbnail(images[Math.floor(Math.random() * images.length)]);

		const pos = current.position;
		// eslint-disable-next-line require-atomic-updates
		current = await this.client.music.decode(current.track);
		const tracks = await serverQueue.tracks();
		let np = `・[${current.title}](${current.uri})\n[ ${parseTime(pos, 2)} / ${parseTime(current.length, 2)} ].`;
		if (serverQueue.player.paused) np = `⏸ Paused:\n${np}\n\n`;
		else np = `🎵 Now playing:\n${np}\n\n`;

		if (!tracks.length) {
			embed.setDescription(`${np}🎶 Empty Queue!`);
			embed.setFooter('🎵 Playing 1 song.');
			return message.channel.send(embed);
		}
		/**
		 * @type {Array<string>}
		 */
		const songs = await this.client.music.decode(tracks).then(decoded => decoded.map(song => song.info));
		const time = parseTime(songs.reduce((total, song) => total + song.length, 0));
		const paginated = paginate(songs);
		let paginatedSongs = paginated.items[0].map(song => {
			const index = `${songs.indexOf(song) + 1}`.padStart(4).padEnd(6);
			return `\`${index}\`・[${song.title}](${song.uri}) [${parseTime(song.length, 2)}].`;
		});

		embed.setDescription(`${np}🎶 Queued up:\n${paginatedSongs.join('\n')}`);
		embed.setFooter(`🎶 Playing ${tracks.length + 1} songs | ${time} long.`);
		if (paginated.pages === 1) return message.channel.send(embed);

		embed.setFooter(`🎶 Playing ${tracks.length + 1} songs | ${time} long. [Page 1 / ${paginated.pages}]`);

		const m = await message.channel.send(embed);

		// Left arrow and Right arrow.
		await m.react('749472347341324310');
		await m.react('749472347332804610');
		let page = 0;

		try {
			await m.awaitReactions(
				/**
				 * @param {MessageReaction} r - The reaction.
				 * @param {User} u - The user.
				 * @returns {*} - The return value is not important for us here.
				 */
				async (r, u) => {
					await r.users.remove(u);
					if (u.id !== message.author.id) return undefined;

					if (r.emoji.id === '749472347332804610' && page !== (paginated.pages - 1)) page++;
					else if (r.emoji.id === '749472347332804610') page = 0;
					else if (r.emoji.id === '749472347341324310' && page !== 0) page--;
					else if (r.emoji.id === '749472347341324310') page = paginated.pages - 1;
					else return undefined;

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
			return m.reactions.removeAll();
		}
		return undefined;
	}
}

module.exports = QueueCommand;
