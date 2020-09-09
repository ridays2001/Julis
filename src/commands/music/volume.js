const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class VolumeCommand extends Command {
	constructor() {
		super('volume', {
			aliases: ['volume', 'vol'],
			args: [
				{
					id: 'vol',
					type: (_, phrase) => {
						// If there is no input, prompt to ask for it.
						if (!phrase) return undefined;

						// Parse the volume from string to integer.
						const vol = parseInt(phrase, 10);

						// If volume isn't a number, prompt to ask for proper input.
						if (Number.isNaN(vol)) return undefined;

						// If volume is less than 10, then basically no music is being played.
						if (vol < 10) return 10;

						// Volume cannot be greater than 100.
						if (vol > 100) return 100;

						// Return the parsed volume.
						return vol;
					}
				}
			],
			category: 'music',
			description: {
				content: 'Set the volume of music.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`@Julis ${this.aliases[0]}`, 'Do something')
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
	 * @param {number} args.vol - The volume to set.
	 * @returns {*}
	 */
	async exec(message, { vol }) {
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		// Check if the member is in a voice channel or not.
		if (!message.member.voice || !message.member.voice.channel) {
			embed.setDescription('You need to join the voice channel before adjusting the volume!');
			return message.channel.send(embed);
		}

		// Check if there is a dj Role set for the server.
		const djRole = message.guild.roles.cache.get(this.client.gData.get(message.guild, 'djRole', undefined));

		// Cache the size of the voice channel.
		const vcSize = message.member.voice.channel.members.size;

		// Store whether volume adjustment is allowed in this scenario or not.
		let permission = false;

		// Check for permissions.
		if (djRole && message.member.roles.cache.has(djRole.id)) permission = true;
		else if (vcSize < 3) permission = true;
		else if (message.member.hasPermission(8)) permission = true;
		else permission = false;

		// If the member doesn't have enough permissions, then ignore their request.
		if (!permission) {
			embed.setDescription('Sorry, you don\'t have the permissions to adjust the volume.');
			return message.channel.send(embed);
		}

		// Get the music queue for the server.
		const serverQueue = this.client.music.queues.get(message.guild.id);

		// Adjust the volume to the requested level.
		await serverQueue.player.setVolume(vol);

		embed.setDescription(`Volume adjusted to **${vol}**.`);
		return message.channel.send(embed);
	}
}

module.exports = VolumeCommand;
