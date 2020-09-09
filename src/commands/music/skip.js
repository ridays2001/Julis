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

		/**
		 * Check if the member is in the music channel or not.
		 * [P.S. - This line just checks for a voice channel. Not "the" music channel specifically.]
		 * I am still trying out various experiments for this.
		 */
		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to be in the music channel before trying to skip songs.');
			return message.channel.send(embed);
		}

		// Get the music queue for this server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song.
		const currentSong = await serverQueue.current();

		/**
		 * @description - The songs queued up for the server.
		 * @type {Array}
		 */
		const tracks = await serverQueue.tracks();

		// This variable will store whether we've to skip all the currently queued songs or not.
		let skipAll = false;

		// Check whether there is a song being played or not.
		if (!currentSong?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// If the user requests to skip more songs than the queue size, skip all.
		if (num > tracks.length) skipAll = true;

		let trackList = [];

		// Remove the songs from the track list.
		if (num > 1) trackList = tracks.splice(0, num - 1);

		// Add the currently playing song to the track list.
		trackList = [currentSong.track].concat(trackList);

		// Check if there is a dj role set for the server.
		const djRole = message.guild.roles.cache.get(this.client.gData.get(message.guild, 'djRole', undefined));

		// Cache the size of the voice channel.
		const vcSize = message.member.voice.channel.members.size;

		// Store whether a skip is allowed in this scenario or not. Decided by multiple factors.
		let skipPerms = false;

		if (djRole && message.member.roles.cache.has(djRole.id)) {
			// Factor 1: the member has a dj role.
			skipPerms = true;
		} else if (vcSize < 3) {
			// Factor 2: the member is alone in the music channel. [Bot + Member = 2 members].
			skipPerms = true;
		} else if (message.member.permissions.has(8)) {
			// Factor 3: the member is an admin.
			skipPerms = true;
			message.channel.send('Administrator overrides... Skipping song.');
		} else {
			// Else, a voting must happen.

			// Get the current votes.
			let currentVotes = this.client.musica.votes.get(message.guild.id);

			// Add one.
			if (currentVotes > 0) currentVotes += 1;
			else currentVotes = 1;

			// Save the votes.
			this.client.musica.votes.set(message.guild.id, currentVotes);

			// Required votes is approximately equal to half the number of members listening to the music.
			const requiredVotes = Math.floor(vcSize / 2);
			const moreVotes = requiredVotes - currentVotes;

			if (moreVotes > 0) {
				// Don't skip the song if there are some votes pending.
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

			// Else, skip the song.
			skipPerms = true;
			message.channel.send(`[${currentVotes} votes obtained!] Skipping song now...`);
		}

		// If there is no permission to skip, then don't skip the song.
		if (!skipPerms) {
			embed.setDescription('You don\'t have permission to skip the song.');
			return message.channel.send(embed);
		}

		// Reset the votes to prevent chaos.
		this.client.musica.votes.delete(message.guild.id);

		// Turn off the music loop.
		this.client.musica.loop.delete(message.guild.id);

		/**
		 * @description - The decoded array of songs which are skipped.
		 * @type {Array}
		 */
		const decodedSongs = await this.client.music.decode(trackList);
		const songs = decodedSongs.length;

		// The total time skipped.
		const skippedTime = parseTime(decodedSongs.reduce((total, song) => total + song.info.length, 0));

		// If the member wants to skip all songs, then exit gracefully.
		if (skipAll) {
			await musicExit(message.guild.id, this.client);

			// Put the decoded information into the embed.
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

		// Skip the songs.
		await serverQueue.next(num);

		// Get the song playing after skip and decode it.
		let newSong = await serverQueue.current();
		newSong = await this.client.music.decode(newSong.track);
		const newTime = parseTime(newSong.length, 2);

		// Put the decoded information into the embed.
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
