/* eslint-disable no-use-before-define */
const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');

const gc = require('../../util/globalchat');

class GlobalChatCommand extends Command {
	constructor() {
		super('globalchat', {
			aliases: ['globalchat', 'global', 'gc'],
			category: 'fun',
			description: {
				content: 'Links with a few random channels from other servers.',
				guide: message => {
					/**
					 * @description - A function to send an embed guide for the command.
					 * @param {Message} message - The message object.
					 * @returns {MessageEmbed} - The guide as an embed.
					 */
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription('This command is used to join/leave a global chat connection.')
						.addField(`\`@Julis ${this.aliases[0]}\``, 'To turn on/off the global chat.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {*}
	 */
	exec(message) {
		const globalChat = this.client.gData.get('global', 'globalChat', []);
		const channels = globalChat.map(e => e.channel);

		/**
		 * @description - A function to add a channel to the global chat connection.
		 * @param {TextChannel} channel - The origin channel where the command was used.
		 */
		const addConnection = async channel => {
			// Create a webhook to send messages via the global chat connection.
			const wb = await channel.createWebhook(message.guild.me.displayName, {
				avatar: this.client.user.displayAvatarURL(),
				reason: 'Global chat turned on.'
			});

			// Push the details to the database.
			globalChat.push({ wb: wb.id, channel: channel.id });
			this.client.gData.set('global', 'globalChat', globalChat);

			// Notify others about a new connection.
			const connections = gc.connectionInfo(this.client, false);
			channel.send(connections.add);
			return gc.sendMsg(`<--- ${connections.upd} --->`, channel, this.client);
		};

		// If the channel is already there in the connection, remove it.
		if (channels.includes(message.channel.id)) return gc.delConnection(this.client, message.channel, message);

		// Else, add it to the connection.
		return addConnection(message.channel);
	}
}

module.exports = GlobalChatCommand;
