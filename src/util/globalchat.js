/* eslint-disable no-use-before-define */

const { Message, TextChannel } = require('discord.js');
const { AkairoClient } = require('discord-akairo');

const { mediaKeywords } = require('./data').default;
let globalChat = [];

/**
 * @description - A function to get the connection info string.
 * @param {AkairoClient} client - The client object.
 * @param {boolean} [deleted] - Whether a channel was deleted or not.
 * @returns {{ add: string, del: string, upd: string }} - The object with connection info strings.
 */
const connectionInfo = (client, deleted) => {
	// Update the saved global chat data.
	globalChat = client.gData.get('global', 'globalChat', []);

	// Find the number of linked channels.
	const linked = globalChat.length - 1;

	// Standard messages.
	let add = 'Global chat has been turned on. Will receive messages here.';
	let del = 'Global chat has been turned off. Will no longer receive messages here.';
	let upd = undefined;

	// Tweaking messages according to the requirements.
	if (linked < 1) {
		add += '\nNo channels connected.';
		del += '\nAll channels disconnected.';
		upd = 'No channels connected now.';
	} else if (linked > 1) {
		add += `\nConnected with ${linked} channels.`;
		del += `\nDisconnected with ${linked} channels.`;
		upd = `Now connected with ${linked} channels.`;
	} else {
		add += '\nConnected with 1 channel.';
		del += '\nDisconnected with 1 channel.';
		upd = 'Now connected with 1 channel.';
	}

	// If a channel is deleted, there will be a different message.
	if (deleted) {
		if ((linked - 1) < 1) upd = 'No channels connected now.';
		else if ((linked - 1) > 1) upd = `Now connected with ${linked} channels.`;
		else upd = 'Now connected with 1 channel.';
	}

	// Return the strings.
	return { add, del, upd };
};

/**
 * @description - Sever a connection and inform about it to others.
 * @param {AkairoClient} client - The client object
 * @param {TextChannel} channel - The channel object.
 * @param {Message} msg - Origin message object.
 * @param {number} [error] - Whether there was an error or not.
 * @returns {*}
 */
const delConnection = (client, channel, msg, error) => {
	// Get an array of channels which are connected.
	const channels = globalChat.map(gc => gc.channel);

	// Get the index of the channel which is about to leave the connection.
	const index = channels.indexOf(channel?.id ?? channel);

	// Get the connection info string from the function.
	const connectionString = connectionInfo(client, true);

	if (!error) {
		/*
		 * If there is an error, it has been raised either because of channel deletion or webhook deletion.
		 * Either ways, the next statement will raise a breaking error if there is already an error previously.
		 */
		client.fetchWebhook(globalChat[index].wb).then(wb => wb?.delete('Global chat turned off.'));
	}

	// Remove the channel object from the saved data.
	globalChat.splice(index, 1);

	// Update the db.
	client.gData.set('global', 'globalChat', globalChat);

	// If there is no error, send the connection info string.
	if (!error) channel.send(connectionString.del);

	/*
	 * I have used 2 levels of errors - 1: Webhook deletion and 2: Channel deletion.
	 * So, I tweak the messages accordingly.
	 */
	if (error === 1) {
		sendMsg(
			`${error ? 'Julis' : msg.author.tag}: <--- Connection terminated. ` +
			`${error ? '**Error - Webhook deleted.**' : ''} --->`,
			channel,
			client
		);
	} else if (error === 2) {
		sendMsg(
			`${error ? 'Julis' : msg.author.tag}: <--- Connection terminated. ` +
			`${error ? '**Error - Channel deleted.**' : ''} --->`,
			channel,
			client
		);
	}

	// Pass the data to process further.
	return sendMsg(`<--- ${connectionString.upd} --->`, channel, client);
};

/**
 * @description - Send a message string to all channels in the connection.
 * @param {string} msgString - The message string to send.
 * @param {TextChannel} channel - Origin channel object.
 * @param {AkairoClient} client - The client object.
 * @param {Message} message - The message object.
 */
const sendMsg = (msgString, channel, client, message) => {
	/*
	 * We need to send a message to all the channels connected in the connection.
	 * So, we loop over each channels present in the database.
	 */
	globalChat.forEach(async gc => {
		// Get the channel used in the current iteration.
		let gcChannel = gc.channel;
		if (gcChannel === channel.id) return undefined;

		// Fetch all webhooks that are in the channel.
		const wbs = await client.channels.cache.get(gcChannel)?.fetchWebhooks().then();

		// Fetch the specific webhook which we've made.
		const wb = wbs?.get(gc.wb);

		// Send the message if the webhook exists and return.
		if (wb) return wb.send(msgString, { disableMentions: 'all' });

		// If the webhook is deleted, pass this information forward.

		const connectionString = connectionInfo(client, false).del;
		gcChannel = client.channels.cache.get(gcChannel) ?? gcChannel;

		// If the channel exists, send error code 1, else 2.
		if (gcChannel instanceof TextChannel) {
			gcChannel.send(`Error - Webhook deleted.\n${connectionString}`);
			return delConnection(client, gcChannel, message, 1);
		}
		return delConnection(client, gcChannel, message, 2);
	});
};

/**
 * @description - Filter out mentions, links and other media.
 * @param {Message} message - Origin message object.
 * @returns {string} - The filtered string.
 */
const filter = message => {
	// Regex to detect discord invites.
	const invRegex = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/);

	// Convert the message string to an array for easier iteration.
	const msgArr = message.content.split(' ');

	// This will store the final message parts.
	const msgs = [];

	for (const msg of msgArr) {
		if (msg.startsWith('<@&')) {
			// Filter out role mentions.
			const roleID = msg.replace('<@&', '').replace('>', '');
			const role = message.guild.roles.cache.get(roleID).name;
			if (['everyone', 'here'].includes(role)) msgs.push(`(at)${role}`);
			else msgs.push(`@${role}`);
		} else if (msg.startsWith('<@!') || msg.startsWith('<@')) {
			// Filter out member mentions.
			const memID = msg.replace('<@!', '').replace('<@', '').replace('>', '');
			const mem = message.guild.members.cache.get(memID);
			msgs.push(`@${mem.displayName}`);
		} else if (msg.startsWith('@')) {
			// Filter out other mentions, in case they are missed.
			msgs.push(msg.replace('@', '(at)'));
		} else if (invRegex.test(msg)) {
			// Filter out invite links.
			msgs.push('<--- Invite Link --->');
		} else if (msg.includes('http') || (msg.includes('.') && msg.includes('/'))) {
			// Allow media links only. Filter out others.
			let media = false;
			for (const keyword of mediaKeywords) {
				/*
				 * We can use array.some method here,
				 * but that would waste a bit of time iterating over extra elements in case of a match.
				 */
				if (msg.includes(keyword)) {
					media = true;
					break;
				}
			}

			// If matched with a media keyword, push the string along with a warning.
			if (media) {
				msgs.push(
					'I believe this is a media link.' +
					'Please report to `Riday 💙#7468` in case of any problems.' +
					`\n${msg}`
				);
			} else {
				// Else, censor the link.
				msgs.push('<--- Link --->');
			}
		} else {
			msgs.push(msg);
		}
	}

	// Join the message parts and return.
	return msgs.join(' ');
};

/**
 * @description - Check for attachments and attach them to the message.
 * @param {Message} message - Origin message object.
 * @returns {string} - The attachments.
 */
const attachments = message => {
	if (message.attachments.first()) {
		// Collect the attachment links in an array.
		const links = [];
		message.attachments.array().forEach(attachment => {
			const index = message.attachments.array().indexOf(attachment) + 1;
			if (message.attachments.size > 1) return links.push(`${index}: ${attachment.url}`);
			return links.push(attachment.url);
		});
		// Join them and return the string.
		return `Sent ${links.length} attachment${links.length > 1 ? 's' : ''}:\n${links.join('\n')}`;
	}
	// Return nothing if there are no attachments.
	return undefined;
};

/**
 * @description - The main global chat function.
 * @param {Message} message - Origin message object.
 * @param {AkairoClient} client - The client object.
 */
const gc = async (message, client) => {
	// Update the saved global chat data.
	globalChat = client.gData.get('global', 'globalChat', []);

	// Filter the message.
	const filtered = filter(message);

	// Check if the message is a command or not.
	const parsed = await client.commandHandler.parseCommand(message);
	if (parsed.command) return undefined;

	// Check for attachments.
	const enclosed = attachments(message);

	// Pass the compiled data to process further.
	const len = filtered.length;
	if (len > 1950) return sendMsg(`${message.author.tag}: <--- An obnoxiously long message --->`, message.channel);
	if (enclosed) sendMsg(enclosed, message.channel, client);
	return sendMsg(`${message.author.tag}: ${filtered}`, message.channel, client);
};

module.exports = { connectionInfo, delConnection, sendMsg, filter, attachments, parse: gc };
