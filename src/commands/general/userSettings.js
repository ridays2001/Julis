const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

class UserSettingsCommand extends Command {
	constructor() {
		super('user-settings', {
			aliases: ['user-settings', 'usettings'],
			flags: ['--clear', '--clr', '--default', '--def'],
			optionFlags: ['--color', '--nick', '--nickname'],
			category: 'general',
			description: {
				content: 'Set your personal preferences.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription(
							'As soon as you start this command, ' +
							'you will be asked to follow the guidelines to set your preferences. ' +
							'You can set either one or all preferences at once. The order does not matter. ' +
							'But, make sure that your answer follows the correct prefix.'
						)
						.addField(
							'\`--color <#hex-code>\` or \`--color <integer>\`',
							'To set your preferred color. Must be either the #color-hex-code or color-integer. ' +
							'Google it up!'
						)
						.addField('\`--nickname <your-nickname>\`', 'To set your nickname.')
						.addField('\`--clear\`', 'To restore default settings.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {{color:string, nickname:string, clear:boolean}} - The arguments object.
	 */
	*args(message) {
		const colorFlag = message.content.toLowerCase().includes('--color');
		const nicknameFlag = ['--nick', '--nickname'].includes(message.content.toLowerCase());

		const color = yield {
			match: 'option',
			flag: '--color',
			/**
			 * @param {Message} msg - The message object.
			 * @param {string} phrase - The input phrase.
			 * @returns {string} - The color.
			 */
			type: (msg, phrase) => {
				if (!phrase.length) return undefined;
				if ([phrase.toLowerCase().includes('default')]) return 'def';
				if (!this.handler.resolver.type('color')(msg, phrase)) return undefined;
				return phrase;
			},
			prompt: {
				start: 'Could you please tell me your favorite color?',
				retry: 'I don\'t think that\'s a real color. ' +
					'Could you try again? Maybe you can try looking up your favorite color\'s hex code on Google?',
				cancel: 'Okie. I will leave the preferred color as it is.',
				optional: !colorFlag
			}
		};

		const nickname = yield {
			match: 'option',
			flag: ['--nick', '--nickname'],
			/**
			 * @param {Message} _ - The message object.
			 * @param {string} phrase - The input phrase.
			 * @returns {string} - The nickname.
			 */
			type: (_, phrase) => {
				if (!phrase.length) return undefined;
				if (phrase.toLowerCase().includes('default')) return 'def';
				return phrase;
			},
			prompt: {
				start: 'Could you please tell me your nickname?',
				retry: 'I was not able to catch that nickname. Could you please repeat yourself?',
				cancel: 'Okie. I will leave your nickname as it is.',
				optional: !nicknameFlag
			}
		};

		const clear = yield {
			match: 'flag',
			flag: ['--clear', '--clr', '--default', '--def']
		};

		return { color, nickname, clear };
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {string} args.color - The color to set.
	 * @param {string} args.nickname - The nickname to set.
	 * @param {boolean} args.clear - Whether to reset to defaults or not.
	 */
	async exec(message, { color, nickname, clear }) {
		const user = message.author;

		// Get saved preferences from the db.
		const db = {
			color: this.client.uData.get(user, 'color', undefined),
			nickname: this.client.uData.get(user, 'nickname', undefined),
			exclusive: this.client.uData.get(user, 'exclusive', false)
		};

		// If the clear flag is specified, then clear all saved preferences and move on.
		if (clear) {
			db.color = undefined;
			db.nickname = undefined;
			message.channel.send('All preferences have been reset to default.');
		} else {
			// Else check for other flags and set preferences to the db accordingly.

			if (color) {
				if (color === 'def') {
					db.color = undefined;
					message.channel.send('Preferred color has been reset to default.');
				} else {
					db.color = color;
					const colorName = this.client.color(color).name;
					message.channel.send(`Now, I know your favorite color is **${colorName}**.`);
				}
			}

			if (nickname) {
				if (nickname === 'def') {
					db.nickname = undefined;
					message.channel.send('Okie. You don\'t have a nickname.');
				} else {
					db.nickname = nickname;
					message.channel.send(`From now on, I will call you **${nickname}**.`);
				}
			}
		}

		// Set the local variables to the database.
		this.client.uData.set(user, 'color', db.color);
		this.client.uData.set(user, 'nickname', db.nickname);

		// Set the data into an embed.
		const finalPreferences = new MessageEmbed();
		finalPreferences.setColor(db.color ?? process.env.COLOR)
			.setAuthor(`Preferences for ${user.tag}`, user.displayAvatarURL())
			.addField('**Color**', `${db.color || '<--- Not set --->'}`, true)
			.addField('**Nickname**', `${db.nickname || '<--- Not set --->'}`, true)
			.setTimestamp();
		if (db.exclusive) {
			finalPreferences.addField('👑 **Exclusive User**', `${db.exclusive ? 'Yes!' : 'No.'}`, false);
		}

		// Send the embed to the channel.
		return message.channel.send('Here are your final preferences.', finalPreferences);
	}
}

module.exports = UserSettingsCommand;
