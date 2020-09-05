const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class InviteCommand extends Command {
	constructor() {
		super('invite', {
			aliases: ['invite', 'inv'],
			category: 'general',
			description: {
				content: 'Invite me to your server.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Invite me to your server.')
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
	async exec(message) {
		// Generate an invite with admin perms, for all mod privileges.
		const inv = await this.client.generateInvite(['ADMINISTRATOR']);

		// Get the user object of the owner.
		const owner = this.client.users.cache.get(this.client.ownerID);

		// Fill the data in the embed.
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setDescription(`[Invite me to the party! ↗](${inv})`)
			.setFooter(`© ${owner.tag}`, owner.displayAvatarURL())
			.setTimestamp();
		return message.channel.send(embed);
	}
}

module.exports = InviteCommand;
