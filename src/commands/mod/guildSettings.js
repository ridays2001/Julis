const { Command } = require('discord-akairo');
const { MessageEmbed, Message, Channel } = require('discord.js');

class GuildSettingsCommand extends Command {
	constructor() {
		super('guild-settings', {
			aliases: ['guild-settings', 'gsettings'],
			flags: ['--clear', '--clr', '--default', '--def'],
			optionFlags: ['--color', '--modlog', '--serverlog', '--memberlog', '--prefix', '--strict'],
			category: 'mod',
			userPermissions: 'MANAGE_GUILD',
			description: {
				content: 'Adjust your server preferences.',
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription(
							'As soon as you start this command, ' +
							'you will be asked to follow the guidelines to set your server preferences. ' +
							'You can set either one or all at once. The order does not matter. ' +
							'But, make sure that your answer follows the correct prefix.'
						)
						.addField(
							'\`--color <#hex-code>\` or \`--color <integer>\`',
							'To set the preferred color for your server. ' +
							'Must be either the #color-hex-code or color-integer. Google it up!'
						)
						.addField('\`--modlog #channel\`', 'To set a modlog channel for your server.')
						.addField(
							'\`--serverlog #channel\`',
							'To set a serverlog channel for your server. [Message edits/deletes]'
						)
						.addField('\`--memberlog #channel\`', 'To set a memberlog channel for your server.')
						.addField(
							'\`--prefix <prefix>\`',
							'To set a custom prefix for your server. Prefixes should not exceed 3 characters.'
						)
						.addField('\`--clear\`', 'To clear all settings.')
						.setTimestamp();
					return guide;
				}
			},
			channel: 'guild'
		});
	}

	/**
	 *
	 * @param {Message} message - The message object.
	 * @returns {{color:string, modLog:Channel}}
	 */
	*args(message) {
		const colorFlag = message.content.toLowerCase().includes('--color');
		const modLogFlag = message.content.toLowerCase().includes('--modlog');
		const serverLogFlag = message.content.toLowerCase().includes('--serverlog');
		const memberLogFlag = message.content.toLowerCase().includes('--memberlog');
		const prefixFlag = message.content.toLowerCase().includes('--prefix');
		const strictFlag = message.content.toLowerCase().includes('--strict');

		const color = yield {
			match: 'option',
			flag: '--color',
			type: (message, phrase) => {
				if (!phrase.length) return undefined;
				if (['def', 'default'].includes(phrase.toLowerCase())) return 'def';
				if (!this.handler.resolver.type('color')(message, phrase)) return undefined;
				return phrase;
			},
			prompt: {
				start: 'Could you tell me the theme color of this server?',
				retry: 'I don\'t think that\'s a real color. Could you please repeat yourself?' +
					' Maybe try looking up your favorite color\'s hex code on Google?',
				cancel: 'Okie. I will leave your server settings the same as before.',
				optional: !colorFlag
			},
			unordered: true
		};

		const modLog = yield {
			match: 'option',
			flag: '--modlog',
			type: (message, phrase) => {
				if (!phrase.length) return undefined;
				if (['def', 'default'].includes(phrase.toLowerCase())) return 'def';
				const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache, false);
				if (!channel) return undefined;
				return channel;
			},
			prompt: {
				start: 'Could you tell me the channel where I should send all the mod logs?',
				retry: 'I was not able to find that channel in this server. Could you please repeat yourself?',
				cancel: 'Okie. I will leave your server preferences the same as before.',
				optional: !modLogFlag
			},
			unordered: true
		};

		const serverLog = yield {
			match: 'option',
			flag: '--serverlog',
			type: (message, phrase) => {
				if (!phrase.length) return undefined;
				if (['def', 'default'].includes(phrase.toLowerCase())) return 'def';
				const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache, false);
				if (!channel) return undefined;
				return channel;
			},
			prompt: {
				start: 'Could you tell me where I should send all the server logs?',
				retry: 'I was not able to find that channel for server logs in this server. ' +
					'Could you please repeat yourself?',
				cancel: 'Okie. I will leave your server preferences the same as before.',
				optional: !serverLogFlag
			},
			unordered: true
		};

		const memberLog = yield {
			match: 'option',
			flag: '--memberlog',
			type: (message, phrase) => {
				if (!phrase.length) return undefined;
				if (['def', 'default'].includes(phrase.toLowerCase())) return 'def';
				const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache, false);
				if (!channel) return undefined;
				return channel;
			},
			prompt: {
				start: 'Could you tell me where I should send all the member logs?',
				retry: 'I was not able to find that channel for member logs in this server. ' +
					'Could you please repeat yourself?',
				cancel: 'Okie. I will leave your server preferences the same as before.',
				optional: !memberLogFlag
			},
			unordered: true
		};

		const prefix = yield {
			match: 'option',
			flag: '--prefix',
			type: (_, phrase) => {
				if (!phrase.length) return undefined;
				if (['def', 'default'].includes(phrase.toLowerCase())) return '+';
				if (!/\s/.test(phrase) && phrase.length <= 5) return phrase;
				return undefined;
			},
			prompt: {
				start: 'Could you tell me which prefix I should listen to?',
				retry: 'I was not able to catch that prefix. Could you please repeat yourself?' +
					' Make sure that you don\'t have any blank spaces and the prefix is less than 5 chars long.',
				cancel: 'Okie. I will leave your server preferences the same as before.',
				optional: !prefixFlag
			},
			unordered: true
		};

		const strict = yield {
			match: 'option',
			flag: 'strict',
			type: (_, phrase) => {
				if (!strictFlag) return undefined;
				if (!phrase.length) return 'switch';
				if (phrase.toLowerCase().trim() === 'on') return 'on';
				return 'off';
			},
			unordered: true
		};

		const clear = yield {
			match: 'flag',
			flag: ['--clear', '--clr', '--default', '--def']
		};

		return { color, modLog, serverLog, memberLog, prefix, strict, clear };
	}

	/**
	 * @param {Message} message - The message object.
	 */

	exec(message, { color, modLog, serverLog, memberLog, prefix, strict, clear }) {
		const { guild: server } = message;
		if (!message.member.permissions.has('MANAGE_GUILD')) {
			return message.channel.send('You need \`MANAGE_GUILD\` permission to use this command.');
		}

		const logChannels = this.client.gData.get(server, 'logChannels', {});
		const db = {
			color: this.client.gData.get(server, 'color', undefined),
			strict: this.client.gData.get(server, 'strict', false),
			prefix: this.client.gData.get(server, 'prefix', '+')
		};

		if (clear) {
			db.color = undefined;
			db.strict = false;
			logChannels.modLog = false;
			logChannels.serverLog = false;
			logChannels.memberLog = false;
			message.channel.send('All preferences have been reset to default.');
		} else {
			if (color) {
				if (color === 'def') {
					db.color = undefined;
					message.channel.send(`So, **${server.name}** does not have a theme color?`);
				} else {
					db.color = color;
					const { name: colorName } = this.client.color(color);
					message.channel.send(`Now, I know the theme color of **${server.name}** is **${colorName}**.`);
				}
			}

			const noRecord = [];

			if (modLog) {
				if (modLog === 'def') {
					logChannels.modLog = undefined;
					noRecord.push('mod logs');
				} else {
					logChannels.modLog = modLog.id;
					message.channel.send(`From now on, mod logs will be sent to ${modLog} channel.`);
				}
			}

			if (memberLog) {
				if (memberLog === 'def') {
					logChannels.memberLog = undefined;
					noRecord.push('member logs');
				} else {
					logChannels.memberLog = memberLog.id;
					message.channel.send(`From now on, member logs will be sent to ${memberLog} channel.`);
				}
			}

			if (serverLog) {
				if (serverLog === 'def') {
					logChannels.serverLog = undefined;
					noRecord.push('server logs');
				} else {
					logChannels.serverLog = serverLog.id;
					message.channel.send(`From now on, server logs will be sent to ${serverLog} channel.`);
				}
			}

			if (noRecord.length) {
				let logs = undefined;
				if (noRecord.length === 1) logs = `__*${noRecord[0]}*__`;
				else if (noRecord.length === 2) logs = `__*${noRecord[0]}*__ and __*${noRecord[1]}*__`;
				else logs = `__*${noRecord[0]}*__, __*${noRecord[1]}*__ and __*${noRecord[2]}*__`;
				message.channel.send(`Okie. I will no longer record ${logs} for **${server.name}**.`);
			}

			if (prefix) {
				db.prefix = prefix;
				message.channel.send(`From now on, my prefix for **${server.name}** is **${prefix}**.`);
			}

			if (strict) {
				let toggle = undefined;
				if (strict === 'switch') toggle = db.strict ? false : true;
				else if (strict === 'on') toggle = true;
				else toggle = false;
				db.strict = toggle;
				message.channel.send(`Strict mode has been turned ${toggle ? 'on' : 'off'}.`);
			}
		}

		this.client.gData.set(server, 'color', db.color);
		this.client.gData.set(server, 'strict', db.strict);
		this.client.gData.set(server, 'prefix', db.prefix);
		this.client.gData.set(server, 'logChannels', logChannels);

		modLog = logChannels.modLog ? `<#${logChannels.modLog}>` : undefined;
		serverLog = logChannels.serverLog ? `<#${logChannels.serverLog}>` : undefined;
		memberLog = logChannels.memberLog ? `<#${logChannels.memberLog}>` : undefined;

		const finalSettings = new MessageEmbed();
		finalSettings.setColor(db.color ?? process.env.COLOR)
			.setAuthor(`Preferences for ${server.name}`, server.iconURL())
			.addField('**Color**', `${db.color ? db.color : '<--- Not set --->'}`)
			.addField('**Mod Log**', `${modLog || '<--- Not set --->'}`, true)
			.addField('**Server Log**', `${serverLog || '<--- Not set --->'}`, true)
			.addField('**Member Log**', `${memberLog || '<--- Not set --->'}`, true)
			.addField('**Prefix**', db.prefix)
			.addField('**Strict Mode**', `${db.strict ? 'On' : 'Off'}`)
			.setTimestamp();
		return message.channel.send('Here are your final preferences.', finalSettings);
	}
}

module.exports = GuildSettingsCommand;
