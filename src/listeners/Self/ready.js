const { Listener } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const logger = require('../../../util/logger');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	exec() {
		// Store the number of servers, users and channels in variables for later use.
		const guilds = `${this.client.guilds.cache.size} servers`;
		const users = `${this.client.users.cache.size} users`;
		const channels = `${this.client.channels.cache.size} channels`;

		// Log ready information to the console.
		logger.info(`Woke up in ${guilds}, with ${users} in ${channels}.`);
		logger.info(`I am ${this.client.user.tag}.`);

		/*
		 * Set the bot activity.
		 * Amor Omnia Vincit is the latin for "Love conquers everything."
		 */
		this.client.user.setActivity('💙Amor Omnia Vincit❤️');

		/*
		 * Here, the idea is to record all timestamps whenever the bot wakes up to plan out various commands.
		 * Therefore, I send an embed with timestamp to a dedicated channel.
		 */

		const readyEmbed = new MessageEmbed();
		readyEmbed.setColor(process.env.COLOR)
			.setAuthor(`${this.client.user.tag}`, this.client.user.displayAvatarURL())
			.setTitle('Good Morning!')
			.setDescription(`I am currently in **${guilds}**, with **${users}** in **${channels}**.`)
			.setTimestamp(this.client.readyAt);

		// BootLog variable stores the channel ID of a dedicated channel which I have made to record whenever I wake up.
		return this.client.channels.cache.get(process.env.bootLog)?.send(`<@${process.env.OwnerID}>`, readyEmbed);
	}
}

module.exports = ReadyListener;
