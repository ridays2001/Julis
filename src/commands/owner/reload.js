const { Command, AkairoModule } = require('discord-akairo');
const { Message } = require('discord.js');
const logger = require('../../util/logger');

class ReloadCommand extends Command {
	constructor() {
		super('reload', {
			aliases: ['reload', 'r'],
			category: 'owner',
			description: { content: 'Reloads a module or all modules at once.' },
			ownerOnly: true
		});
	}

	/**
	 * @returns {{type:string, module:AkairoModule}} - The arguments.
	 */
	*args() {
		const type = yield {
			type: [
				['c', 'commands'],
				['i', 'inhibitors'],
				['l', 'listener']
			]
		};

		const module = yield {
			type: (msg, phrase) => {
				if (!phrase) return null;
				const resolver = this.handler.resolver.type({
					c: 'commandAlias',
					i: 'inhibitor',
					l: 'listener'
				}[type]);
				return resolver(msg, phrase);
			}
		};

		return { type, module };
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The arguments object.
	 * @param {string} args.type - The type of modules to reload.
	 * @param {AkairoModule} args.module - The module to reload.
	 * @returns {*}
	 */
	exec(message, { type, module }) {
		// Log it to the console.
		logger.info('<--- Reload --->');

		// If no type is provided, reload everything.
		if (!type) {
			const inhibitors = this.client.inhibitorHandler.removeAll() && this.client.inhibitorHandler.loadAll();
			const listeners = this.client.listenerHandler.removeAll() && this.client.listenerHandler.loadAll();
			const commands = this.client.commandHandler.removeAll() && this.client.commandHandler.loadAll();

			if (inhibitors && listeners && commands) {
				return message.channel.send(
					`Reloaded ${commands.modules.size} commands, ` +
					`${listeners.modules.size} listeners and ` +
					`${inhibitors.modules.size} inhibitors.`
				);
			}

			return message.channel.send(
				`${this.client.prefName(message)}, Some unknown error occurred. Please try again.`
			);
		}

		// If no module is provided, reload all modules of that type.
		if (!module) {
			if (type === 'c') {
				const commands = this.client.commandHandler.removeAll() && this.client.commandHandler.loadAll();
				if (commands) {
					return message.channel.send(`Reloaded ${commands.modules.size} commands.`);
				}
				return message.channel.send(
					`${this.client.prefName(message)}, Some unknown error occurred. Please try again.`
				);
			}

			if (type === 'i') {
				const inhibitors = this.client.inhibitorHandler.removeAll() && this.client.inhibitorHandler.loadAll();
				if (inhibitors) {
					return message.channel.send(`Reloaded ${inhibitors.modules.size} inhibitors.`);
				}
				return message.channel.send(
					`${this.client.prefName(message)}, Some unknown error occurred. Please try again.`
				);
			}

			if (type === 'l') {
				const listeners = this.client.listenerHandler.removeAll() && this.client.listenerHandler.loadAll();
				if (listeners) {
					return message.channel.send(`Reloaded ${listeners.modules.size} listeners.`);
				}
				return message.channel.send(
					`${this.client.prefName(message)}, Some unknown error occurred. Please try again.`
				);
			}
		}

		// Reload a specific module.
		try {
			module.reload();
			return message.channel.send(
				`${this.client.prefName(message)}, Successfully reloaded ${type} \`${module.id}\`.`
			);
		} catch (err) {
			logger.err(`[Error] Cannot reload [${type}]: ${module.id}`);
			return message.channel.send(`${this.client.prefName(message)}, Failed to reload ${type} \`${module.id}\`.`);
		}
	}
}

module.exports = ReloadCommand;
