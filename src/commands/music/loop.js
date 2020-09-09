const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class LoopCommand extends Command {
	constructor() {
		super('loop', {
			aliases: ['loop'],
			category: 'music',
			description: {
				content: 'Loop the music.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`@Julis ${this.aliases[0]}`, 'Toggle the music loop.')
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
		const current = await serverQueue.current();

		// If there are no songs, then no need for the loop.
		if (!current?.track) {
			embed.setDescription('I\'m not playing any music in this server!');
			return message.channel.send(embed);
		}

		// Get the dj role.
		const djRole = message.guild.roles.cache.get(this.client.gData.get(message.guild, 'djRole', undefined));

		// Cache the voice channel size.
		const vcSize = message.member.voice.channel.members.size;

		// Save the permission to loop.
		let permission = false;

		// Check for the permission.
		if (djRole && message.member.roles.cache.has(djRole.id)) permission = true;
		else if (message.member.hasPermission(8)) permission = true;
		else if (vcSize < 3) permission = true;
		else permission = false;

		// If the member doesn't have the permission, then don't do anything.
		if (!permission) {
			embed.setDescription('Sorry! You don\'t have the permission to manage the music loop.');
			return message.channel.send(embed);
		}

		// Save the loop map for quick access.
		const loops = this.client.musica.loop;

		// If the loop is on, then turn it off. Else, turn it on.
		if (loops.get(message.guild.id)) loops.delete(message.guild.id);
		else loops.set(message.guild.id, true);

		// Number of songs to loop over.
		const songs = await serverQueue.tracks().then(tracks => tracks.length + 1);

		embed.setDescription(`🔁 Music loop ${loops.get(message.guild.id) ? 'started' : 'stopped'}.`)
			.setFooter(
				`🎶 ${loops.get(message.guild.id) ? 'Looping over' : 'Playing'} ${songs} song${songs > 1 ? 's' : ''}.`
			);

		return message.channel.send(embed);
	}
}

module.exports = LoopCommand;
