const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');

const SOURCES = ['stable', 'master', 'rpc', 'commando', 'akairo', 'akairo-master', 'v11'];

class DocsCommand extends Command {
	constructor() {
		super('docs', {
			aliases: ['docs'],
			args: [
				{
					id: 'query',
					match: 'rest',
					type: 'lowercase',
					prompt: {
						start: 'What would you like to search for?'
					}
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '--f']
				}
			],
			category: 'docs',
			description: {
				content: 'Search in documentation for guidance.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription('This command is used to fetch the Discord.js documentation from the Djs docs.')
						.addField(`\`@Julis ${this.aliases[0]} <query>\``, 'Search Discord.js documentation.')
						.addField(`\`@Julis ${this.aliases[0]} <query> <version>\``, 'Advanced documentation search.')
						.addField(`\`@Julis -f ${this.aliases[0]} <query>\``, 'List out hidden attributes.')
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
	 * @param {boolean} args.force - Whether to look for hidden methods or not.
	 */
	async exec(message, { query, force }) {
		// We take the last element from the query argument to check the source of the docs.
		query = query.split(' ');
		let source = SOURCES.includes(query.slice(-1)[0]) ? query.pop() : 'stable';

		// Akairo uses the docs for "akairo-master" category. The default one does not work.
		if (source.includes('akairo')) source = 'akairo-master';

		// The old D.js v11 docs.
		if (source === 'v11') source = 'https://raw.githubusercontent.com/discordjs/discord.js/docs/v11.json';

		// Get the docs from api in the form of an embed.
		const queryString = qs.stringify({ src: source, q: query.join(' '), force });
		const embed = await fetch(`https://djsdocs.sorta.moe/v2/embed?${queryString}`).then(res => res.json());

		// Check if docs exist or not.
		if (!embed || embed.error) {
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

		// Change the color of the embed object received from the server.
		embed.color = this.client.prefColor(message.author, message.guild);

		/*
		 * In case of Akairo docs, we change some basic info.
		 * The basic docs which we use for Akairo are Akairo-master, so we change the Akairo-master to Akairo.
		 * The default icon_url does not work, so we replace it with a new version.
		 */
		if (source === 'akairo-master') {
			embed.author.name = 'Akairo Docs';
			embed.author.icon_url = 'https://i.imgur.com/0fmL6RE.png';
		}

		// Check if the client has the permissions to add reactions to a message.
		const hasReactPerms = message.channel.permissionsFor(message.guild.me).has(
			['ADD_REACTIONS', 'MANAGE_MESSAGES'],
			false
		);

		// If the client does not have the permissions to react, send the embed and return.
		if (message.channel.type === 'dm' || !hasReactPerms) {
			return message.util.send({ embed });
		}

		// If the client has the permissions to react, add a waste bucket reaction and listen to it.
		const msg = await message.util.send({ embed });
		msg.react('🗑');

		let react = undefined;
		try {
			// Listen to the reaction. If the user reacts with the waste bucket, delete the message.
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (e) {
			// Else remove the reactions.
			return msg.reactions.removeAll();
		}
		// Delete the message if there is a reaction and no errors are raised.
		return react.first().message.delete();
	}
}

module.exports = DocsCommand;
