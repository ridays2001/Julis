const { Command } = require('discord-akairo');
const { MessageEmbed, Message } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');

class NPMCommand extends Command {
	constructor() {
		super('npm', {
			aliases: ['npm'],
			args: [
				{
					id: 'pkg',
					prompt: {
						start: 'What would you like to search for?'
					},
					match: 'content',
					/**
					 * @description - Encode the package name to uri components.
					 * @param {Message} _ - The message object.
					 * @param {string} pkg - The package name.
					 * @returns {string} - The name of the package encoded as uri components.
					*/
					type: (_, pkg) => pkg ? encodeURIComponent(pkg.replace(/ /g, '-')) : null
				}
			],
			category: 'docs',
			description: {
				content: 'Search for npm packages.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				*/
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(`\`@Julis ${this.aliases[0]} <package>\``, 'Get information about a npm package.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {string} args.pkg - The name of the package to look for.
	 */
	async exec(message, { pkg }) {
		/**
		 * @description - A function to delete extra elements from an array and format it into a string.
		 * @param {Array<string>} arr - The array to format.
		 * @returns {string} - The formatted string.
		 */
		const manageArr = arr => {
			if (!arr || !arr.length) return 'None';
			const res = [];
			if (arr.length > 10) {
				res.push(...arr.slice(0, 9));
				res.push(`... ${arr.length - 9} more.`);
				return res.join(', ');
			}
			return arr.join(', ');
		};

		// Fetch the data of the package from the api.
		const body = await fetch(`https://registry.npmjs.com/${pkg.toLowerCase()}`).then(res => res.json());

		// Check if the package exists or not.
		if (body.error) {
			return message.util.send({
				embed: {
					author: {
						name: `${this.client.prefName(message)}, I couldn\'t find that package.`,
						icon_url: message.author.displayAvatarURL()
					},
					color: this.client.prefColor(message.author, message.guild)
				}
			});
		}

		// If a package is unpublished, it doesn't have the time property.
		if (!body.time) {
			return message.util.send({
				embed: {
					author: {
						name: `${this.client.prefName(message)}, The owner of this package decided to unpublish it.`,
						icon_url: message.author.displayAvatarURL()
					},
					color: this.client.prefColor(message.author, message.guild)
				}
			});
		}

		// Extract api data into variables.
		const latest = body.versions[body['dist-tags'].latest];
		const maintainers = manageArr(latest.maintainers.map(user => user.name));

		// Format dependencies into a string.
		const dependencies = latest.dependencies ? manageArr(Object.keys(latest.dependencies)) : 'None';

		// Fill the data into an embed.
		const embed = new MessageEmbed()
			.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(latest.name)
			.setURL(`https://www.npmjs.com/package/${latest.name}`)
			.setDescription(body.description || 'No description.')
			.addField('Version', latest.version, true)
			.addField('License', latest.license || 'None', true)
			.addField('Author', latest.author?.name ?? '???', true)
			.addField('Creation Date', moment.utc(body.time.created).format('DD-MM-YYYY kk:mm:ss'), true)
			.addField('Modification Date', moment.utc(body.time.modified).format('DD-MM-YYYY kk:mm:ss'), true)
			.addField('Homepage', `[Jump ↗](${latest.homepage})`, true)
			.addField('Dependencies', dependencies, true)
			.addField('Maintainers', maintainers, true)
			.setTimestamp();

		// Check if the client has the permissions to add reactions to a message.
		const hasReactPerms = !message.channel.permissionsFor(message.guild.me).has(
			['ADD_REACTIONS', 'MANAGE_MESSAGES'],
			false
		);

		// If the client does not have the permissions to react, send the embed and return.
		if (message.channel.type === 'dm' || hasReactPerms) {
			return message.util.send({ embed });
		}
		const msg = await message.util.send({ embed });
		msg.react('🗑');

		let react;
		try {
			// Listen to the reaction. If the user reacts with the waste bucket, delete the message.
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (error) {
			// Else remove the reactions.
			return msg.reactions.removeAll();
		}
		// Delete the message if there is a reaction and no errors are raised.
		return react.first().message.delete();
	}
}

module.exports = NPMCommand;
