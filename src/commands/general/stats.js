const { Command, version: akairoVersion } = require('discord-akairo');
const { Message, MessageEmbed, version: djsVersion } = require('discord.js');
const os = require('os-utils');

const { parseDuration } = require('../../util/util');

class StatsCommand extends Command {
	constructor() {
		super('stats', {
			aliases: ['stats'],
			category: 'general',
			description: {
				content: 'Get my basic stats',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Get my stats.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {*}
	 */
	exec(message) {
		// Parse the uptimes to human readable format.
		const uptime = parseDuration(this.client.uptime);
		const lavalink = parseDuration(this.client.musica.uptime);

		// Get the memory status.
		const used = Math.floor(process.memoryUsage().heapUsed / (1024 ** 2));
		const free = Math.floor(os.freemem());

		// Get the servers, channels, and users count.
		const servers = `**${this.client.guilds.cache.size}** servers`;
		const channels = `**${this.client.channels.cache.size}** channels`;
		const users = `**${this.client.users.cache.size}** users`;

		// Get the user object of the owner.
		const owner = this.client.users.cache.get(this.client.ownerID);

		// Get the library versions.
		const node = `[Node.js - ${process.version}](https://nodejs.org/en/)`;
		const djs = `[Discord.js - v${djsVersion}](https://discord.js.org/)`;
		const akairo = `[Discord Akairo - v${akairoVersion}](https://discord-akairo.github.io/)`;

		// Fill the data into the embed.
		const embed = new MessageEmbed();
		embed.setColor(process.env.COLOR)
			.setDescription(
				`**__Memory:__**\n・My server uses **${used} MiB** of memory, with **${free} MiB** free.\n\n` +
				`**__Uptime:__**\n・I'm up since **${uptime}**.\n・My music server is up since **${lavalink}**.\n\n` +
				`**__General:__**\n・${servers}, ${channels}, and ${users}.\n\n` +
				`**__Technologies:__**\n・${node}\n・${djs}\n・${akairo}\n\n` +
				'・[GitHub ↗](https://github.com/ridays2001/Julis/)'
			)
			.setFooter(`© ${owner.tag}`, owner.displayAvatarURL())
			.setTimestamp();

		// Send the embed.
		return message.channel.send(embed);
	}
}

module.exports = StatsCommand;
