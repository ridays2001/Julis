const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const { musicExit } = require('../../util/util');

class JoinCommand extends Command {
	constructor() {
		super('join', {
			aliases: ['join'],
			category: 'music',
			description: {
				content: 'Invite me to join your voice channel.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Join your voice channel.')
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

		if (!message.member.voice || !message.member.voice.channel) {
			// Check whether the member is in a voice channel or not.
			embed.setDescription('You need to join a voice channel in order to listen to the music!');
			return message.util.send(embed);
		} else if (!message.member.voice.channel.joinable) {
			// Check if that channel is joinable or not.
			embed.setDescription('I don\'t have the permission to join that channel.');
			return message.util.send(embed);
		} else if (!message.member.voice.channel.speakable) {
			// Check if the bot has permission to speak in that channel or not.
			embed.setDescription('I don\'t have the permission to speak in that channel.');
			return message.util.send(embed);
		}

		// Get the music queue for this server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Get the currently playing song for the server.
		const current = await serverQueue.current();

		// Exit gracefully if there are no songs being played.
		if (!current?.track) {
			await musicExit(message.guild.id, this.client);
			embed.setDescription('I\'m not playing any songs in this server!');
			return message.channel.send(embed);
		}

		// Join the voice channel.
		await serverQueue.player.join(message.member.voice.channel.id);

		// Get the music queue and put the information into an embed.
		const tracks = await serverQueue.tracks().then(tracks => tracks.length + 1);
		embed.setFooter(`🎶 Playing ${tracks} song${tracks > 1 ? 's' : ''}.`);
		embed.setDescription('Joined! 👍🏻');
		return message.channel.send(embed);
	}
}

module.exports = JoinCommand;
