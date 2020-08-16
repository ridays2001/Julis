const { Command } = require('discord-akairo');
const { Message, MessageEmbed, User } = require('discord.js');

class AvatarCommand extends Command {
	constructor() {
		super('avatar', {
			aliases: ['avatar', 'dp', 'pfp', 'av'],
			args: [
				{
					id: 'user',
					/**
					 * @param {Message} msg - The message object.
					 * @param {string} phrase - The input phrase argument.
					 * @returns {User} - The resolved user.
					*/
					type: async (msg, phrase) => {
						const resolvedUser = this.handler.resolver.type('user')(msg, phrase);
						if (resolvedUser) return resolvedUser;
						if (!/^[0-9]*$/.test(phrase)) return msg.author;
						const user = await this.client.users.fetch(phrase);
						if (!user) return msg.author;
						return user;
					}
				}
			],
			category: 'fun',
			description: {
				content: 'See the profile picture of a user.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				*/
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription(
							'This command is used to contact the API and get the profile picture of a specific user.'
						)
						.addField(`@Julis ${this.aliases[0]} \`<No Arguments>\``, 'Your profile picture')
						.addField(`@Julis ${this.aliases[0]} \`@User\``, 'Profile picture of that user.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {User} args.user - The user whose avatar is requested.
	 */
	async exec(message, { user }) {
		/*
		* Adding the dynamic property will automatically resolve the GIF avatars and prevent them from
		* being converted to still images.
		*
		* The size is set to 2048 which is the maximum.
		*/
		const avatar = user.displayAvatarURL({ dynamic: true, size: 2048 });

		// Send an embed with the avatar image.
		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(user))
			.setTitle(user.tag)
			.setImage(avatar)
			.setTimestamp();
		return message.util.send(embed);
	}
}

module.exports = AvatarCommand;
