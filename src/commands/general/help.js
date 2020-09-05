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
		// Check if there are any args. Prompt if args are present.
		const input = message.content.toLowerCase().split(' ').pop();
		const prompt = !this.aliases.includes(input);

		// Check the input to see what it is - Command or Category.
		const section = yield {
			/**
			 * @param {Message} msg - The message object.
			 * @param {string} phrase - The input phrase.
			 * @returns {{category: string, command: Command}}
			 */
			type: (msg, phrase) => {
				// Check the input and convert it to lowercase.
				if (!phrase || !phrase.length) return undefined;
				phrase = phrase.toLowerCase();

				/**
				 * @description - Resolve the input phrase and check if it matches with a command or not.
				 * @type {Command}
				 */
				const command = this.handler.resolver.type('commandAlias')(msg, phrase);
				if (command) {
					// If it is a command, don't parse commands from some restricted categories.
					if (command.category.id === 'sub-command') return undefined;
					if (command.category.id === 'owner' && !this.client.isOwner(msg.author)) return undefined;

					// Return an object with the command module.
					return { command };
				}

				// If it isn't a command, it either has to be a category or it has to be wrong.
				const keys = Object.keys(categories);
				if (keys.some(k => phrase.toLowerCase().includes(k))) {
					// If it is a category, then return the category name.
					return { category: phrase };
				}

				// Else, it is wrong. Prompt user to ask about it.
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
		// The basic embed.
		const prefix = this.client.gData.get(message.guild, 'prefix', process.env.PREFIX);
		let embed = new MessageEmbed()
			.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(this.client.prefName(message), message.author.displayAvatarURL())
			.setFooter(
				`My prefix for ${message.guild.name} is ${prefix} or @Julis\n` +
				'Use the reactions below to navigate through the help menu.' +
				' React with  ℹ  to go to the instructions page.'
			)
			.setTimestamp();
		const desc = [];

		/**
		 * @description - This array will store objects of each category page.
		 * @type {Array<{emoji:string, page:string}>}
		 */
		const parts = [];
		// eslint-disable-next-line guard-for-in
		for (const key in categories) {
			const c = categories[key];
			if (!c.validation(message)) continue;
			desc.push(`・**__${c.display}__** - ${c.description}`);
			parts.push({ emoji: c.emoji, page: c.id });
		}

		// If there is an input, then the help embed will be for that section.
		if (section) {
			if (section.command) {
				// If it is a command, then get the guide embed from the command module.
				embed = section.command.description.guide(message);

				// Add all aliases for that particular command.
				embed.addField('Aliases', `\`${section.command.aliases.join('` | `')}\``);
			} else if (section.category) {
				/*
				 * For category, we've added the category data in the util/data file.
				 * Get the data from there and merge it with the list of commands.
				 */
				const category = categories[section.category];
				const commands = this.handler.categories.get(category.id).array();
				const commandList = commands.map(c => `・**__${c.id}__** - ${c.description.content}`);
				embed.setTitle(category.display)
					.setDescription(commandList.join('\n'));
			}
		} else {
			// If there is no input, then just send the categories summary page.
			embed.setDescription(desc.join('\n\n'));
		}

		// Send the embed and react to it.
		const m = await message.channel.send(embed);
		await m.react('746616698219790378');

		// This is the delay function so that our bot doesn't hit rate limits.
		const delay = () => new Promise(res => setTimeout(res, 250));

		for (const emoji of parts.map(p => p.emoji)) {
			await m.react(emoji);
			await delay();
		}

		// Listen to the reactions.
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

					// Ignore if it's someone else reacts.
					if (u.id !== message.author.id) return undefined;

					// Remove all fields from the embed.
					embed.spliceFields(0, 25);

					// If it is the information emoji, send the categories summary page.
					if (r.emoji.id === '746616698219790378') {
						embed.setDescription(desc.join('\n\n'))
							.setTitle('');
						return m.edit(embed);
					}

					/*
					 * Change category pages dynamically.
					 * Check which index the emoji id is at and determine category accordingly.
					 */
					const emojis = parts.map(p => p.emoji);
					if (!emojis.includes(r.emoji.id)) return undefined;

					// Get the index of the emoji and set the category page accordingly.
					const index = emojis.indexOf(r.emoji.id);
					const category = categories[parts[index].page];
					const commands = this.handler.categories.get(category.id).array();
					const commandList = commands.map(c => `・**__${c.id}__** - ${c.description.content}`);

					// Modify the embed with the new data and edit the message with it.
					embed.setTitle(category.display)
						.setDescription(commandList.join('\n'));
					return m.edit(embed);
				}, { time: 6e4, errors: ['time'] }
			);
		} catch (e) {
			// Remove all reactions on time up.
			return m.reactions.removeAll();
		}
		// End the program gracefully.
		return undefined;
	}
}

module.exports = HelpCommand;
