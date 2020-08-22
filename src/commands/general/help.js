const { Command } = require('discord-akairo');
const { Message, MessageEmbed, MessageReaction, User } = require('discord.js');
const { categories } = require('../../util/data');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'commands'],
			category: 'general',
			description: {
				content: 'Get the list of commands.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.addField(
							`\`@Julis ${this.aliases[0]}\``, 'Get the list of all commands, arranged category-wise.'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} <category>\``,
							'Get the list of all commands under a specific category.'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} <command>\``,
							'Get detailed information about a specific command.'
						)
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {{ section: { category: string, command: Command } }}
	 */
	*args(message) {
		const input = message.content.toLowerCase().split(' ').pop();
		const prompt = !this.aliases.includes(input);
		const section = yield {
			/**
			 * @param {Message} msg - The message object.
			 * @param {string} phrase - The input phrase.
			 * @returns {{category: string, command: Command}}
			 */
			type: (msg, phrase) => {
				phrase = phrase.toLowerCase();

				const command = this.handler.resolver.type('commandAlias')(msg, phrase);
				if (command && command.category.id !== 'sub-command') return { command };

				const keys = Object.keys(categories);
				if (keys.some(k => phrase.toLowerCase().includes(k))) {
					return { category: phrase };
				}

				return undefined;
			},
			prompt: {
				start: 'Which command do you want help with?',
				retry: 'I couldn\'t find which command you\'re talking about. Could you please say that again?',
				optional: prompt
			}
		};
		return { section };
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {Object} args.section - The section of help.
	 * @param {string} args.section.category - The category name, if this is a category.
	 * @param {Command} args.section.command - The command object if this is a command.
	 * @returns {*}
	 */
	async exec(message, { section }) {
		// Save the prefix and the footer in a variable for quick access.
		const prefix = this.client.gData.get(message.guild, 'prefix', process.env.PREFIX);
		const footer = `My prefix for ${message.guild.name} is ${prefix} or @Julis\n` +
			'Use the reactions below to navigate through the help menu.' +
			' React with  ℹ  to go to the instructions page.';

		// This array will store chunks of description.
		const desc = [];

		/**
		 * @description - This array will store objects of each category page.
		 * @type {Array<{emoji:string, page:string}>}
		 */
		const parts = [];

		// eslint-disable-next-line guard-for-in
		for (const key in categories) {
			// This loop will assign the content to the arrays depending upon the member's permission.
			const c = categories[key];
			if (!c.validation(message)) continue;
			desc.push(`・**__${c.display}__** - ${c.description}`);
			parts.push({ emoji: c.emoji, page: c.id });
		}

		let embed = new MessageEmbed()
			.setColor(this.client.prefColor(message.author, message.guild))
			.setTimestamp();

		// Depending upon the arguments, put the data into the embed.
		if (section) {
			if (section.command) {
				// If it is a command, then show the "guide" part from the command's description.
				embed = section.command.description.guide(message);
				embed.addField('Aliases', `\`${section.command.aliases.join(', ')}\``);
			} else if (section.category) {
				// If it is a category, then show the category details.
				const category = categories[section.category];
				const commands = this.handler.categories.get(category.id).array();
				const commandList = commands.map(c => `・**__${c.id}__** - ${c.description.content}`);
				embed.setTitle(category.display)
					.setDescription(commandList.join('\n'));
			}
		} else {
			// Else, show the main help page.
			embed.setDescription(desc.join('\n\n'));
		}
		embed.setFooter(footer);

		// Send the embed to the channel and listen to it's reactions.
		const m = await message.channel.send(embed);
		await m.react('746616698219790378');

		// This is the standard delay function so that our bot doesn't hit any rate limits.
		const delay = () => new Promise(res => setTimeout(res, 250));

		// Add the necessary reactions to the message.
		for (const emoji of parts.map(p => p.emoji)) {
			await m.react(emoji);
			await delay();
		}

		try {
			await m.awaitReactions(
				/**
				 * @param {MessageReaction} r - The message reaction.
				 * @param {User} u - The user who reacted.
				 * @returns {*}
				 */
				async (r, u) => {
					// Remove the reaction for better UX.
					await r.users.remove(u);

					// Ignore if it is reacted by someone else.
					if (u.id !== message.author.id) return undefined;

					// Change the category page.
					const categoryEmbed = new MessageEmbed();
					categoryEmbed.setColor(this.client.prefColor(message.author, message.guild))
						.setFooter(footer)
						.setTimestamp();

					// If the emoji id matches the info emoji, then show the summary page.
					if (r.emoji.id === '746616698219790378') {
						categoryEmbed.setDescription(desc.join('\n\n'));
						return m.edit(categoryEmbed);
					}

					/*
					 * Change category pages dynamically, according to it's index in the parts array.
					 * Ignore the reaction if it is not in the parts array.
					 */
					const emojis = parts.map(p => p.emoji);
					if (!emojis.includes(r.emoji.id)) return undefined;

					const index = emojis.indexOf(r.emoji.id);
					const category = categories[parts[index].page];
					const commands = this.handler.categories.get(category.id).array();
					const commandList = commands.map(c => `・**__${c.id}__** - ${c.description.content}`);
					categoryEmbed.setTitle(category.display)
						.setDescription(commandList.join('\n'))
						.setFooter(footer);
					return m.edit(categoryEmbed);
				}, { time: 6e4, errors: ['time'] }
			);
		} catch (e) {
			// Remove all reactions after 1 minute.
			return m.reactions.removeAll();
		}
		// End the command.
		return undefined;
	}
}

module.exports = HelpCommand;
