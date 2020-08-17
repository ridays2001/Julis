const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class SettingsCommand extends Command {
	constructor() {
		super('settings', {
			aliases: ['settings', 'preferences'],
			args: [
				{
					id: 'user',
					match: 'flag',
					flag: ['--user', '--u']
				},
				{
					id: 'server',
					match: 'flag',
					flag: ['--server', '--s', '--guild', '--g']
				}
			],
			category: 'general',
			description: {
				content: 'Set your personal/server preferences.',
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
							'Preference Level:\n' +
							'❯ 1. 👑 User (Exclusive)\n' +
							'❯ 2. ⚙ Server (Strict)\n' +
							'❯ 3. User\n' +
							'❯ 4. Server\n\n' +
							'Note - You need to be a moderator of the server to change server preferences.\n'
						)
						.addField(`\`@Julis ${this.aliases[0]} --user\``, 'To set your personal preferences.')
						.addField(`\`@Julis ${this.aliases[0]} --server\``, 'To set server preferences.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {boolean} [args.user] - Jump to user settings.
	 * @param {boolean} [args.server] - Jump to server settings.
	 */
	async exec(message, { user, server }) {
		// Get the modules first and store them in a variable.
		const userSettings = this.handler.modules.get('user-settings');
		const guildSettings = this.handler.modules.get('guild-settings');

		// User preferences section. Sends to user-settings module after taking input.
		const userPrefs = async () => {
			const user = message.author;

			// Get saved preferences from the database.
			const db = {
				color: this.client.uData.get(user, 'color', undefined),
				nickname: this.client.uData.get(user, 'nickname', undefined),
				exclusive: this.client.uData.get(user, 'exclusive', false)
			};

			// Set the data into an embed.
			const preferences = new MessageEmbed();
			preferences.setColor(this.client.prefColor(user))
				.setAuthor(`Preferences for ${user.tag}`, user.displayAvatarURL())
				.addField('**Color**', `${db.color || '<--- Not set --->'}`, true)
				.addField('**Nickname**', `${db.nickname || '<--- Not set --->'}`, true)
				.setTimestamp();
			if (db.exclusive) preferences.addField('**👑 Exclusive User**', `${db.exclusive ? 'Yes!' : 'No.'}`, false);

			// Send the embed to the channel.
			message.channel.send('Would you like to edit your preferences? [ Yes / no]', preferences);

			// Listen for responses.
			const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
				max: 1,
				time: 10000
			});

			// Send error message if the user didn't respond.
			if (!responses || responses.size !== 1) return message.channel.send('Time\'s up!');

			// Get the first message from the responses collection.
			const response = responses.first();

			// Test response for y, yes, or yea.
			if (/^y(?:e(?:a|s)?)?$/i.test(response.content)) {
				// Send instructions for additional arguments.
				message.channel.send(
					'To update your preferences, you need to use the prefix followed by your answer:\n' +
					'\`--nickname <your-nickname>\`\n' +
					'\`--color <#hex-code or color-integer>\`\n' +
					'\`--clear - To clear all saved preferences.\`\n\n' +
					'**__Note:__** You can use either one or all at the same time. ' +
					'The order does not matter, but make sure that your answer follows after the prefix. ' +
					'If you want to use a nickname with more than one word, ' +
					'enter just \`--nickname\` and don\'t provide an answer. I will ask for your nickname again.' +
					'You can also enter it in quotation marks like --nickname "my nickname". ' +
					'If you want to set anything to default value, use `default` as the value and ' +
					'I will reset it to defaults.'
				);

				// Listen for responses.
				const responses2 = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
					max: 1,
					time: 30000
				});

				// Send error message if the user didn't respond.
				if (!responses2 || responses2.size !== 1) return message.channel.send('Time\'s up!');

				// Get the first message from the responses collection.
				const response2 = responses2.first();

				// Test the response for cancel.
				if (response2.content.toLowerCase() === 'cancel') {
					return message.channel.send('Your preferences were left the same as before.');
				}

				// Redirect forward after match.
				return this.handler.handleDirectCommand(response2, response2.content, userSettings, true);
			}
			return message.channel.send('Okie. Your preferences were left the same as before.');
		};

		// Server preferences section. Sends to guild-settings module after taking input.
		const serverPrefs = async () => {
			const server = message.guild;

			// Check if the member has the permission to manage the guild.
			if (!message.member.permissions.has('MANAGE_GUILD')) {
				return message.channel.send('You do not have the `MANAGE_GUILD` permission required for this action.');
			}

			// Get the saved settings from the database.
			const logChannels = this.client.gData.get(server, 'logChannels', {});
			const db = {
				color: this.client.gData.get(server, 'color', undefined),
				strict: this.client.gData.get(server, 'strict', false),
				prefix: this.client.gData.get(server, 'prefix', '+')
			};

			// Parse the data into user friendly format.
			const modLog = logChannels.modLog ? `<#${logChannels.modLog}>` : '<--- Not set --->';
			const serverLog = logChannels.serverLog ? `<#${logChannels.serverLog}>` : '<--- Not set --->';
			const memberLog = logChannels.memberLog ? `<#${logChannels.memberLog}>` : '<--- Not set --->';

			// Set the data into an embed.
			const preferences = new MessageEmbed();
			preferences.setColor(this.client.prefColor(undefined, server))
				.setAuthor(`Preferences for ${server.name}`, server.iconURL())
				.addField('**Color**', `${db.color ? db.color : '<--- Not set --->'}`)
				.addField('**Mod Log**', `${modLog || '<--- Not set --->'}`, true)
				.addField('**Server Log**', `${serverLog || '<--- Not set --->'}`, true)
				.addField('**Member Log**', `${memberLog || '<--- Not set --->'}`, true)
				.addField('**Prefix**', db.prefix)
				.addField('**Strict Mode**', `${db.strict ? 'On' : 'Off'}`)
				.setTimestamp();

			// Send the embed to the channel.
			message.channel.send('Would you like to edit your server preferences? [ Yes / no ]', preferences);

			// Listen for responses.
			const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
				max: 1,
				time: 10000
			});

			// Send error message if the user didn't respond.
			if (!responses || responses.size !== 1) return message.channel.send('Time\'s up!');

			// Get the first message from the responses collection.
			const response = responses.first();

			// Test response for y, yes, or yea.
			if (/^y(?:e(?:a|s)?)?$/i.test(response.content)) {
				// Send instructions for additional arguments.
				message.channel.send(
					'To update your server settings, you need to use the prefix followed by your answer:\n' +
					'\`--color <#hex-code or integer>\`\n' +
					'\`--modlog #channel\`\n' +
					'\`--memberlog #channel\`\n' +
					'\`--prefix <prefix>\`\n' +
					'\`--strict <on or off>\`\n' +
					'\`--clear - To clear all saved settings.\`\n\n' +
					'**__Note:__** You can use either one or all at the same time. ' +
					'The order does not matter, but make sure that your answer follows after the prefix.'
				);

				// Listen for responses.
				const responses2 = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
					max: 1,
					time: 30000
				});

				// Send error message if the user didn't respond.
				if (!responses2 || responses2.size !== 1) return message.channel.send('Time\'s up!');

				// Get the first message from the responses collection.
				const response2 = responses2.first();

				// Test the response for cancel.
				if (response2.content.toLowerCase() === 'cancel') {
					return message.channel.send('Server preferences were left the same as before.');
				}
				// Redirect forward after match.
				return this.handler.handleDirectCommand(response2, response2.content, guildSettings, true);
			}
			return message.channel.send('Okie. Server preferences were left the same as before.');
		};

		// Send to respective sections. If both are provided, then user prefs are taken preference.
		if (user) {
			return userPrefs();
		}
		if (server) {
			return serverPrefs();
		}

		// Redirect to user preferences section if the member doesn't have the permission to manage the guild.
		if (!message.member.permissions.has('MANAGE_GUILD')) return userPrefs();

		// Ask where to redirect if the member has the permission to manage the guild.
		message.channel.send('Whose preferences would you like to edit?\n\n-- User : `--u`\n-- Server : `--s`');
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
			max: 1,
			time: 10000
		});

		// Send error message if the user didn't respond.
		if (!responses || responses.size !== 1) return message.channel.send('Time\'s up!');

		// Get the first message from the responses collection.
		const response = responses.first();

		// Redirect to respective sections depending upon the response.
		if (['-u', '- u'].some(u => response.content.toLowerCase().includes(u))) return userPrefs();
		if (['-s', '- s'].some(s => response.content.toLowerCase().includes(s))) return serverPrefs();

		// Return error if the user didn't respond properly.
		return message.channel.send(
			'I was not able to determine whose preferences you want to edit. Could you please try again?'
		);
	}
}

module.exports = SettingsCommand;
