const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const { parseTime, musicExit } = require('../../util/util');

class SkipCommand extends Command {
	constructor() {
		super('skip', {
			aliases: ['skip', 's'],
			args: [
				{
					id: 'num',
					type: 'number',
					default: 1
				}
			],
			category: 'music',
			description: {
				content: 'Skip the currently playing song.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Skip the currently playing song.')
						.addField(`\`@Julis ${this.aliases[0]} <number>\``, 'Skip a few songs at once.')
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
	 * @param {number} [args.num = 1] - The number of songs to skip.
	 * @returns {*}
	 */
	async exec(message, { num }) {
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to be in the music channel before trying to skip songs.');
			return message.channel.send(embed);
		}

		const serverQueue = this.client.music.queues.get(message.guild.id);
		const currentSong = await serverQueue.current();

		/**
		 * @type {Array}
		 */
		const tracks = await serverQueue.tracks();
		let skipAll = false;

		if (!currentSong?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		if (num > tracks.length) skipAll = true;

		let trackList = [];
		if (num > 1) trackList = tracks.splice(0, num - 1);
		trackList = [currentSong.track].concat(trackList);

		const djRole = this.client.channels.cache.get(this.client.gData.get(message.guild, 'djRole', undefined));
		const vcSize = message.member.voice.channel.members.size;
		let skipPerms = false;

		if (djRole) {
			skipPerms = message.member.roles.cache.has(djRole);
		} else if (vcSize < 3) {
			skipPerms = true;
		} else if (message.member.permissions.has(8)) {
			skipPerms = true;
			message.channel.send('Administrator overrides... Skipping song.');
		} else {
			let currentVotes = this.client.musica.votes.get(message.guild.id);
			if (currentVotes > 0) currentVotes += 1;
			else currentVotes = 1;
			this.client.musica.votes.set(message.guild.id, currentVotes);

			const requiredVotes = Math.floor(vcSize / 2);
			const moreVotes = requiredVotes - currentVotes;

			if (moreVotes > 0) {
				embed.setDescription(
					'Sorry, you don\'t have the permission to skip the song. ' +
					'You need to vote amongst yourselves to skip the song. ' +
					'You can also get someone with the DJ role or a server admin to skip the song immediately.\n' +
					`There are ${vcSize} members listening to music. ` +
					`You need at least ${requiredVotes} to skip the song.` +
					`Currently, you have ${currentVotes} votes. ` +
					`You need ${moreVotes} more vote${moreVotes > 1 ? 's' : ''}!.`
				);
				return message.channel.send(embed);
			}

			skipPerms = true;
			message.channel.send(`[${currentVotes} votes obtained!] Skipping song now...`);
		}

		if (!skipPerms) {
			embed.setDescription('You don\'t have permission to skip the song.');
			return message.channel.send(embed);
		}

		this.client.musica.votes.set(message.guild.id, 0);
		this.client.musica.loop.set(message.guild.id, false);

		/**
		 * @type {Array}
		 */
		const decodedSongs = await this.client.music.decode(trackList);
		const songs = decodedSongs.length;
		const skippedTime = parseTime(decodedSongs.reduce((total, song) => total + song.info.length, 0));

		if (skipAll) {
			await musicExit(message.guild.id, this.client);
			if (songs === 1) {
				const { info } = decodedSongs[0];
				embed.setDescription(`Skipped [${info.title}](${info.uri}) [${skippedTime} long].`);
				embed.setFooter('⏩ Skipped last song.');
			} else {
				embed.setDescription(
					`Skipped ${songs} songs.\n` +
					`${decodedSongs.slice(0, 4).map(song => `・[${song.info.title}](${song.info.uri})`).join('\n')}` +
					`${songs > 5 ? `\n...${songs - 5} more song${songs > 1 ? 's' : ''}.` : ''}\n` +
					`[${skippedTime} long.]`
				);
				embed.setFooter('⏩ Skipped all songs.');
			}
			return message.channel.send(embed);
		}

		await serverQueue.next(num);

		let newSong = await serverQueue.current();
		newSong = await this.client.music.decode(newSong.track);
		const newTime = parseTime(newSong.length, 2);

		if (songs === 1) {
			const { info } = decodedSongs[0];
			embed.setDescription(
				`Skipped [${info.title}](${info.uri}) [${skippedTime} long].\n\n` +
				`Now Playing:\n[${newSong.title}](${newSong.uri}) [0:00 / ${newTime}]`
			);
		} else {
			embed.setDescription(
				`Skipped ${songs} songs.\n` +
				`${decodedSongs.slice(0, 4).map(song => `・[${song.info.title}](${song.info.uri})`).join('\n')}` +
				`${songs > 5 ? `\n...${songs - 5} more song${songs > 1 ? 's' : ''}.` : ''}\n` +
				`[${skippedTime} long.]\n\n` +
				`Now Playing:\n[${newSong.title}](${newSong.uri}) [0:00 / ${newTime}]`
			);
		}
		embed.setFooter(`⏩ Skipped ${songs} song${songs > 1 ? 's' : ''}.`);
		return message.channel.send(embed);
	}
}

module.exports = SkipCommand;
