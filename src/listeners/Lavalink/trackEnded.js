const { AkairoClient } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const { parseTime, musicExit } = require('../../util/util');

/**
 * @description - This function is used to send music feeds.
 * @param {*} data - The data sent from Lavalink music server.
 * @param {AkairoClient} client - The client object.
 * @returns {*}
 */
module.exports = async (data, client) => {
	// Get the server object.
	const server = client.guilds.cache.get(data.guildId);

	// Get the music feed channel.
	const channel = client.channels.cache.get(client.musica.feed.get(server?.id));

	// Don't do anything if server or channel not found.
	if (!server || !channel) return undefined;

	// Decode the song that just ended.
	const song = await client.music.decode(data.track);

	/*
	 * Sometimes, there's a small lag in updating the "current" in the music server.
	 * So, we add a 1 second delay to solve that problem.
	 */
	return setTimeout(async () => {
		// Get the music queue for the server.
		const serverQueue = await client.music.queues.get(data.guildId);

		// Get the immediately next song.
		const next = await serverQueue.current().then(n => client.music.decode(n?.track ?? []));

		const embed = new MessageEmbed();
		embed.setColor(client.prefColor(undefined, server))
			.setAuthor(server.name, server.iconURL())
			.setDescription(
				`🎵 Song ended:\n・[${song.title}](${song.uri}) [${parseTime(song.length)} long].\n\n` +
				'🎶 Next up:\n'
			)
			.setTimestamp();

		// If there is no next song, then inform them about it.
		if (!next?.title) {
			await musicExit(data.guildId, client);
			if (!channel) return undefined;
			embed.setDescription(`${embed.description}Nothing!`);
			embed.setFooter('⏹ Stopped music.');
			return channel.send(embed);
		}

		// Get the music queue and decode it to get their information.
		const tracks = await serverQueue.tracks().then(tracks => client.music.decode(tracks));

		// Put the information into the embed.
		embed.setDescription(`${embed.description}・[${next.title}](${song.uri}) [${parseTime(next.length)} long].`);

		// If the music queue is empty, then there would only be one song - the next one.
		if (!tracks.length) {
			embed.setFooter(`🎵 Playing 1 song | ${parseTime(next.length)} long.`);
			return channel.send(embed);
		}

		// Get the total time of the music queue.
		const time = tracks.reduce((total, song) => total + song.info.length, 0) + next.length;

		// Put the data into the embed.
		embed.setDescription(`${embed.description}\n・${tracks.length} more songs.`);
		embed.setFooter(`🎶 Playing ${tracks.length + 1} songs | ${parseTime(time)} long.`);
		return channel.send(embed);
	}, 1000);
};
