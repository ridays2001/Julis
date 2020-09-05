/* eslint-disable line-comment-position */

const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { User, Guild, Message } = require('discord.js');
const nearestColor = require('nearest-color');
const namedColors = require('color-name-list');
const { Client: lavaqueue } = require('lavaqueue');

const { firestore } = require('../struct/Database');
const uDataProvider = require('../struct/uDataProvider');
const gDataProvider = require('../struct/gDataProvider');
const { prefColor, prefName } = require('../util/preferences');

class JulisClient extends AkairoClient {
	constructor() {
		super({ ownerID: process.env.OwnerID }, {
			disableEveryone: true,
			partials: ['MESSAGE', 'CHANNEL'], // Listen to uncached stuff.
			// Disable the events mentioned below to optimise bot speed.
			disabledEvents: ['CHANNEL_PINS_UPDATE', 'GUILD_INTEGRATIONS_UPDATE', 'PRESENCE_UPDATE', 'TYPING_START']
		});

		/**
		 * @description A function to find out the nearest named color from a hex code.
		 * @param {string} color - The color hex code.
		 * @returns {string} - The nearest named color.
		 */
		this.color = color => {
			const colors = namedColors.reduce((o, { name, hex }) => Object.assign(o, { [name]: hex }), {});
			const nearestNamedColor = nearestColor.from(colors);
			return nearestNamedColor(color);
		};

		/**
		 * @description A function to find out the preferred color for an embed.
		 * @param {User} [user] - The user object.
		 * @param {Guild} [guild] - The guild object.
		 * @returns {string} - The color string.
		 */
		this.prefColor = (user, guild) => prefColor(user, guild, this);

		/**
		 * @description Function to find out the preferred name of a user.
		 * @param {Message} msg - The message object.
		 * @param {boolean} ignoreNicknames - Ignore nicknames for special cases.
		 * @returns {string} - The name string.
		 */
		this.prefName = (msg, ignoreNicknames) => prefName(msg, ignoreNicknames, this);

		this.uData = new uDataProvider(firestore.collection('uData'));
		this.gData = new gDataProvider(firestore.collection('gData'));

		// Musica is spanish for music.
		this.musica = {
			feed: new Map(), // Store the music feed channels.
			loop: new Map(), // Which servers want to loop.
			votes: new Map() // Store the number of votes to skip.
		};

		// The lavaqueue setup.
		this.music = new lavaqueue({
			userID: process.env.ClientID,
			password: 'youshallnotpass',
			hosts: {
				// This is the lavalink music server information.
				rest: 'http://localhost:2333',
				ws: 'http://localhost:2333',
				redis: { // Redis database configuration.
					host: '127.0.0.1', port: 6379, db: 0
				}
			},
			send: (guild, packet) => {
				const shardGuild = this.guilds.cache.get(guild);
				if (shardGuild) return shardGuild.shard.send(packet);
				return undefined;
			},
			advanceBy: (queue, { previous }) => {
				// This part is for the loop command.
				if (this.musica.loop.get(queue.guildID)) queue.add(previous);
			}
		});

		// Initialize the command handler of the bot and set some data.
		this.commandHandler = new CommandHandler(this, {
			directory: './src/commands', // The folder where all the commands are stored.
			commandUtil: true, // Command Util provides additional utilities.
			allowMention: true, // Allows the bot to be triggered by @Bot.
			fetchMembers: true, // Cache members of servers. Disable if you're facing cache issues.
			handleEdits: true, // This allows the bot to listen to message edits and manage commands accordingly.
			aliasReplacement: /-/g, // Replace the - in the command aliases.
			prefix: message => this.gData.get(message.guild, 'prefix', process.env.PREFIX), // Set the prefix.
			argumentDefaults: { // Set some defaults of all arguments.
				prompt: {
					timeout: 'Time\'s up!',
					ended: 'Too many retries. Try again.',
					cancel: 'Okie. Cancelled.',
					retries: 4,
					time: 30000
				}
			}
		});
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler); // Link to inhibitor handler.
		this.commandHandler.useListenerHandler(this.listenerHandler); // Link to listener handler.
		this.commandHandler.loadAll(); // Load all commands.

		// Initialize the inhibitor handler of the bot.
		this.inhibitorHandler = new InhibitorHandler(this, { directory: './src/inhibitors' });
		this.inhibitorHandler.loadAll(); // Load all inhibitors.

		// Initialize the listener handler of the bot.
		this.listenerHandler = new ListenerHandler(this, { directory: './src/listeners' });
		this.listenerHandler.setEmitters({ // Set the event emitters for the listeners.
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
			lavalink: this.music
		});
		this.listenerHandler.loadAll(); // Load all listeners.
	}

	async start() {
		// Initialize the database instances.
		await this.gData.init();
		await this.uData.init();

		// Login to the Discord API and start the bot.
		return this.login(process.env.TOKEN);
	}
}
module.exports = JulisClient;
