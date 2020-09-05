const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');
const Turndown = require('turndown');

class MDNCommand extends Command {
	constructor() {
		super('mdn', {
			aliases: ['mdn'],
			args: [
				{
					id: 'full',
					match: 'flag',
					flag: ['--full', '-f']
				},
				{
					id: 'query',
					prompt: {
						start: 'What would you like me to search for?',
						cancel: 'Okie. I won\'t search anything.'
					},
					match: 'rest',
					/**
					 * @description - A function to format the input query.
					 * @param {Message} _ - The message object.
					 * @param {string} query - The query string, unformatted.
					 * @returns {string} - The formatted query string.
					 */
					type: (_, query) => query ? query.replace(/#/g, '.prototype.') : null
				}
			],
			regex: /^(?:mdn,) (.+)/i,
			category: 'docs',
			description: {
				content: 'Search MDN javascript documentation for quick reference.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription('This command is used to fetch javascript documentation from the MDN docs.')
						.addField(`\`@Julis ${this.aliases[0]} <query>\``, 'To search MDN JavaScript documentation.')
						.addField(`\`@Julis --full ${this.aliases[0]} <query>\``, 'Get the extended documentation.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {string} args.query - The query to search in the docs.
	 * @param {string} args.match - The query in case if the command is run via the regex method.
	 * @param {boolean} args.full - Whether to show all available methods and properties or not.
	 */
	async exec(message, { query, match, full }) {
		// If the command is run via the regex method, there won't be any args.
		if (!query && match) query = match[1];

		// Fetch the docs from the api.
		const queryString = qs.stringify({ q: query });
		const body = await fetch(`https://mdn-api.vercel.app/?${queryString}`).then(res => res.json());

		// Check if the docs exist or not.
		if (!body.url || !body.title || !body.summary) {
			return message.util.send({
				embed: {
					author: {
						name: `${this.client.prefName(message)}, I couldn\'t find that anywhere in the docs.`,
						icon_url: message.author.displayAvatarURL()
					},
					color: this.client.prefColor(message.author, message.guild)
				}
			});
		}

		/*
		 * Turndown can fix html stuff for us and replace it with markdown.
		 * Here, we define some basic turndown rules.
		 */
		const turndown = new Turndown();
		turndown.addRule('hyperlink', {
			filter: 'a',
			replacement: (text, node) => `[${text}](https://developer.mozilla.org${node.href})`
		});
		turndown.addRule('markdown', {
			filter: 'code',
			replacement: (text, _node) => `\u200b\`${text}\`\u200b`
		});
		turndown.addRule('markdown', {
			filter: 'strong',
			replacement: (text, _node) => `\u200b**${text}**\u200b`
		});

		// Here, we fix the html and replace it with markdown.
		let summary = body.summary.replace(
			/<code><strong>(.+)<\/strong><\/code>/g, '<strong><code>$1<\/code><\/strong>'
		).replace(/<code><(\s*a[^>]*)>(.*?)<\s*\/\s*a><\/code>/g, '<$1><code>$2<\/code><\/a>');
		summary.replace(/&lt;/g, '').replace(/&gt;/g, '');

		// Fix the remaining stuff using turndown.
		summary = turndown.turndown(summary);

		// If the full flag is present, then append the properties and methods, if present.
		if (full) {
			if (body.properties.length) {
				summary += `\n\n**Properties:**\n${body.properties.map(p => `=> ${p.title}`).join('\n')}`;
			}
			if (body.methods.length) {
				summary += `\n\n**Methods:**\n${body.methods.map(m => `=> ${m.title}`).join('\n')}`;
			}
		}

		// Send the docs as an embed.
		const embed = new MessageEmbed()
			.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor('MDN', 'https://i.imgur.com/DFGXabG.png', 'https://developer.mozilla.org/')
			.setURL(body.url)
			.setTitle(body.title)
			.setDescription(summary);

		// Check if the client has the permissions to add reactions to a message.
		const hasReactPerms = !message.channel.permissionsFor(message.guild.me).has(
			['ADD_REACTIONS', 'MANAGE_MESSAGES'],
			false
		);

		// If the client does not have the permissions to react, send the embed and return.
		if (message.channel.type === 'dm' || hasReactPerms) return message.util.send(embed);
		const msg = await message.util.send(embed);
		msg.react('🗑');

		let react = undefined;
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

module.exports = MDNCommand;
