const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const colors = require('color-name-list');

class ColorCommand extends Command {
	constructor() {
		super('color', {
			aliases: ['color'],
			args: [
				{
					id: 'color',
					/**
					 * @param {Message} _ - The message object.
					 * @param {string} phrase - The input phrase.
					 * @returns {string} - The color hex code.
					 */
					type: (_, phrase) => {
						// Exit if there is no input.
						if (!phrase || !phrase.length) return undefined;

						// Transform the input phrase to lowercase and remove the # form it.
						phrase = phrase.toLowerCase().replace(/#/g, '');

						// Check if the input is of one letter and matches the standard hex pattern.
						if (/^[a-f0-9]{1}$/g.test(phrase)) {
							// If yes, then get the color information for it.
							return `#${phrase}${phrase}${phrase}`;
						}

						// Check if the input matches other popular hex code patters.
						if (/^[a-f0-9]{6}$|^[a-f0-9]{3}$/g.test(phrase)) return `#${phrase}`;

						// Activate the prompt if matches fail.
						return undefined;
					},
					prompt: {
						start: 'Which color would you like to see?',
						retry: 'I didn\'t catch that color. Could you please repeat yourself?',
						optional: true
					}
				}
			],
			category: 'fun',
			description: {
				content: 'Get the name of a color from it\'s hex code.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Get a random hex color code with it\'s name.')
						.addField(
							`\`@Julis ${this.aliases[0]} <hex code>\``,
							'Get the name of the color nearest to the hex code.'
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
	 * @param {string} color - The color, parsed as an integer.
	 * @returns {*}
	 */
	exec(message, { color }) {
		// The standard embed.
		const embed = new MessageEmbed();
		embed.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setTimestamp();

		// If there is an input color, then search the library for a color nearest to that.
		if (color) {
			const nearestColor = this.client.color(color);
			nearestColor.value = nearestColor.value.toUpperCase();
			embed.setColor(nearestColor.value)
				.setDescription(
					`**__Nearest Named Color:__**\n**${nearestColor.name}** | **${nearestColor.value}**`
				);
		} else {
			// Else, just get a random color from the color library.
			const random = colors[Math.floor(Math.random() * colors.length)];
			random.hex = random.hex.toUpperCase();
			embed.setColor(random.hex)
				.setDescription(`**__Random Color:__**\n**${random.name}** | **${random.hex}**`);
		}

		// Send the embed.
		return message.channel.send(embed);
	}
}

module.exports = ColorCommand;
