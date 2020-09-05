const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const path = require('path');
const url = require('url');

const { parseTime } = require('../../util/util');

class PlayCommand extends Command {
	constructor() {
		super('play', {
			aliases: ['play', 'p'],
			args: [
				{
					id: 'forced',
					match: 'flag',
					flag: ['--s', '--start']
				},
				{
					id: 'query',
					match: 'rest',
					type: (_, phrase) => phrase.replace(/<(.+)>/g, '$1'),
					default: ''
				}
			],
			category: 'music',
			channel: 'guild',
			description: {
				content: 'Play a song from any possible source.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(
							`\`@Julis ${this.aliases[0]} <song name>\``,
							'Play a song. The song name is searched on YouTube to find a match.'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} <song link>\``,
							'Play a song from link. YouTube, SoundCloud, BandCamp, ' +
							'Twitch, Vimeo, Mixer, or any other online hosted music file works.'
						)
						.addField(`\`@Julis ${this.aliases[0]} <playlist link>\``, 'Play songs from a playlist.')
						.addField(
							`\`@Julis ${this.aliases[0]} <no argument, but an attachment>\``,
							'Play songs from an attachment file.'
						)
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {boolean} args.forced - Whether to play the newly added song immediately or not.
	 * @param {string} args.query - The query string to look for.
	 * @returns {*}
	 */
	async exec(message, { forced, query }) {
		// Check whether the user is an exclusive user or not.
		const exclusive = this.client.uData.get(message.author, 'exclusive', false);

		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		if (!message.member.voice || !message.member.voice.channel) {
			// Check if the member is in a voice channel or not.
			embed.setDescription('You need to join a voice channel in order to listen to the music!');
			return message.util.send(embed);
		} else if (!message.member.voice.channel.joinable) {
			// Check if the bot has permission to join that channel.
			embed.setDescription('I don\'t have the permission to join that channel.');
			return message.util.send(embed);
		} else if (!message.member.voice.channel.speakable) {
			// Check if the bot has permission to speak in that channel.
			embed.setDescription('I don\'t have the permission to speak in that channel.');
			return message.util.send(embed);
		}

		// Music Feed section.
		const showFeed = this.client.gData.get(message.guild, 'musicFeeds', true);
		let musicFeed = this.client.channels.cache.get(this.client.musica.feed.get(message.guild.id));

		if (!musicFeed && showFeed) {
			// If there are no music feed channels saved in cache, then use the current channel.
			musicFeed = message.channel;
			this.client.musica.feed.set(message.guild.id, message.channel.id);
			message.channel.send(`Music feed will be sent to ${musicFeed}.`);
		}

		// If there is no query string, check for message attachments.
		if (!query && message.attachments.first()) {
			// If there is a message attachment, check if it is a voice type file.
			query = message.attachments.first().url;
			if (!['.mp3', '.ogg', '.m4a', '.flac'].includes(path.parse(url.parse(query).path).ext)) return undefined;
		} else if (!query) {
			// End the program here otherwise.
			return undefined;
		}

		// If the query doesn't include a link, then search on youtube.
		if (!['https:', 'http:'].includes(url.parse(query).protocol)) query = `ytsearch:${query}`;

		let trackName = undefined;

		// Load the query in the music server.
		const res = await this.client.music.load(query);

		// Get the music queue for this server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song and the upcoming songs.
		const current = await serverQueue.current();
		const tracks = await serverQueue.tracks();

		// If there are more than 150 tracks in the queue, don't play the song.
		if (tracks.length > 150 && !exclusive) {
			embed.setDescription(
				'Sorry, only exclusive users can add more than 150 songs per queue. ' +
				'[For more info, contact `Riday 💙#7468`]'
			);
			return message.channel.send(embed);
		}

		// Join the voice channel if the bot isn't already in one.
		if (!message.guild.me.voice.channel) await serverQueue.player.join(message.member.voice.channel.id);

		// Parse the data returned from the music server to human readable format.
		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			const time = parseTime(res.tracks[0].info.length);

			// If forced start flag is provided, the play the song immediately next.
			if (forced) await serverQueue.unshift(res.tracks[0].track);
			else await serverQueue.add(res.tracks[0].track);

			trackName = `[${res.tracks[0].info.title}](${res.tracks[0].info.uri})\n[${time} long.]`;
		} else if (res.loadType === 'PLAYLIST_LOADED') {
			// If there are more than a 100 tracks in the queue, then add only first 100.
			if (res.tracks.length > 100 && !exclusive) {
				res.tracks.splice(99);
				embed.addField(
					'**__Note:__**',
					'Sorry, only Exclusive Users can add more than a 100 songs at once. ' +
					'[For more info, contact `Riday 💙#7468`]\n'
				);
			}

			// If there are more than 150 songs after adding the playlist, then remove the extra songs.
			const totalQueue = res.tracks.length + tracks.length;
			if (totalQueue > 150 && !exclusive) {
				res.tracks.splice(150 - totalQueue);
				embed.addField(
					'**__Note:__**',
					'Sorry, only exclusive users can add more than 150 songs per queue. ' +
					'[For more info, contact `Riday 💙#7468`]'
				);
			}

			// Calculate the total playlist time.
			let time = 0;
			for (const track of res.tracks) {
				time += track.info.length;
			}
			time = parseTime(time);

			await serverQueue.add(...res.tracks.map(track => track.track));
			trackName = `**${res.playlistInfo.name}\n[ Playlist - ${res.tracks.length} songs ]\n${time} long.**`;
		} else {
			// If it isn't any of the cases above, then most likely it isn't a match.
			return message.channel.send(
				`${this.client.prefName(message)}, I cannot find the song you're looking for.`
			);
		}

		// If the player isn't playing, then start it.
		if (!serverQueue.player.playing && !serverQueue.player.paused) await serverQueue.start();

		// Add some aesthetics to the embed.
		if (current) embed.setFooter('🎶 Queued up.');
		else embed.setFooter('▶ Now playing.');

		// If query is a url, then link it.
		if (/^http(?:s?)?/i.test(query)) embed.setDescription(`[${trackName}](${query})`);
		else embed.setDescription(trackName);

		// If the song information has an identifier, then use it as thumbnail.
		if (res.tracks[0]?.info?.identifier) {
			embed.setThumbnail(`https://i.ytimg.com/vi/${res.tracks[0].info.identifier}/hqdefault.jpg`);
		} else {
			embed.setThumbnail('https://i.imgur.com/wHzUxWe.png');
		}

		// Send the embed.
		return message.channel.send(embed);
	}
}

module.exports = PlayCommand;
