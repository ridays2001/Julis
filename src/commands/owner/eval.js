/* eslint-disable no-use-before-define */
/* eslint-disable no-eval */

const { Command } = require('discord-akairo');
const { inspect } = require('util');
const vm = require('vm');
vm.createContext({});
const { Message, MessageEmbed } = require('discord.js');

// To use during eval;
const { firestore } = require('../../struct/Database');
const logger = require('../../util/logger');

class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'e'],
			args: [
				{
					id: 'code',
					match: 'content',
					type: 'string',
					prompt: {
						start: message => `${message.author.username}, What would you like me to evaluate?`
					}
				}
			],
			ownerOnly: true,
			quoted: false,
			description: { content: 'Evaluates JS code.' }
		});
	}

	/**
	 * @description - This command is used to evaluate javascript code.
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {string} args.code - The code to evaluate.
	 */
	async exec(message, { code }) {
		// To use during eval.
		const embed = new MessageEmbed();

		/**
		 * @description - This function escapes out back ticks ` and @ from the eval output.
		 * @param {string} text - The text to clean
		 * @returns {string} - Filtered text.
		 */
		const clean = text => text.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`);

		const token = this.client.token.split('').join('[^]{0,2}');
		const rev = this.client.token.split('').reverse().join('[^]{0,2}');
		const filter = new RegExp(`${token}|${rev}`, 'g');

		try {
			// Evaluate the code.
			let output = eval(code);

			// Resolve promises.
			if (
				output instanceof Promise ||
				(output && typeof output.then === 'function' && typeof output.catch === 'function')
			) {
				output = await output;
			}

			// Inspect the output and set some basic properties.
			output = inspect(output, { depth: 0, maxArrayLength: null });

			// Filter the token out from the output.
			output = output.replace(filter, '[TOKEN]');

			// Remove back ticks and mentions.
			output = clean(output);

			return message.channel.send(`${output}`, { split: '\n', code: 'js' });
		} catch (error) {
			return message.channel.send(`The following error occurred \`\`\`js\n${error}\`\`\``);
		}
	}
}

module.exports = EvalCommand;
