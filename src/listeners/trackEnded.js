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
	const server = client.guilds.cache.get(data.guildId);
	const channel = client.channels.cache.get(client.musica.feed.get(server.id));

	// Decode the song that just ended.
	const song = await client.music.decode(data.track);
	const serverQueue = await client.music.queues.get(data.guildId);
	const next = await serverQueue.current().then(n => client.music.decode(n?.track ?? []));

	const embed = new MessageEmbed();
	embed.setColor(client.prefColor(undefined, server))
		.setAuthor(server.name, server.iconURL())
		.setDescription(
			`🎵 Song ended:\n・[${song.title}](${song.uri}) [${parseTime(song.length)} long].\n\n` +
			'🎶 Next up:\n'
		)
		.setTimestamp();

	if (!next?.title) {
		await musicExit(data.guildId, client);
		if (!channel) return undefined;
		embed.setDescription(`${embed.description}Nothing!`);
		embed.setFooter('⏹ Stopped music.');
		return channel.send(embed);
	}

	const tracks = await serverQueue.tracks().then(tracks => client.music.decode(tracks));

	embed.setDescription(`${embed.description}・[${next.title}](${song.uri}) [${parseTime(next.length)} long].`);

	if (!tracks.length) {
		embed.setFooter(`🎵 Playing 1 song | ${parseTime(next.length)} long.`);
		return channel.send(embed);
	}

	const time = tracks.reduce((total, song) => total + song.info.length, 0) + next.length;

	embed.setDescription(`${embed.description}\n・${tracks.length} more songs.`);
	embed.setFooter(`🎶 Playing ${tracks.length + 1} songs | ${parseTime(time)} long.`);
	return channel.send(embed);
};
