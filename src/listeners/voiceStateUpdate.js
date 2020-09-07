const { Listener } = require('discord-akairo');
const { MessageEmbed, VoiceState } = require('discord.js');

class VoiceStateUpdateListener extends Listener {
	constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate'
		});
	}

	/**
	 * @param {VoiceState} oldState - The old voice state.
	 * @param {VoiceState} newState - The new voice state.
	 * @returns {*}
	 */
	async exec(oldState, newState) {
		// Check if both the voice states have a voice channel.
		const oldVC = oldState.guild.me.voice?.channel;
		const newVC = newState.guild.me.voice?.channel;

		// It is useless if there isn't a voice channel in any of the voice states.
		if (!oldVC || !newVC) return undefined;

		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(undefined, newVC.guild))
			.setAuthor(newVC.guild.name, newVC.guild.iconURL())
			.setTimestamp();

		// Get the music queue for that server.
		const serverQueue = this.client.music.queues.get(newState.guild.id);

		// Get the music feed channel.
		const channel = this.client.channels.cache.get(this.client.musica.feed.get(oldState.guild.id));

		/*
		 * If there are no members in the voice channel for the new voice state,
		 * We pause the music to conserve the bandwidth limits and also for better UX.
		 */
		if (newVC.members.size <= 1 && serverQueue.player.playing) {
			await serverQueue.player.pause();

			// If there is no music feed channel, don't proceed.
			if (!channel) return undefined;

			embed.setDescription(
				'The music channel is empty. I\'ve paused the music for this server.' +
				' Join again within one minute to automatically resume the music.'
			);

			const m = await channel.send(embed);

			// Set a temporary value to store the message id.
			this.client.musica.feed.set(`${newVC.guild.id}.d`, m.id);

			// Leave the music channel after 1 minute.
			setTimeout(async () => {
				// If there is someone in the voice chat now, then don't do anything.
				if (newVC.members.size > 1) return undefined;

				// Leave the music channel.
				await serverQueue.player.leave();
				embed.setDescription(
					'Okie. It seems that nobody wants to listen to the music. I\'ll go ahead and take a break.' +
					' To continue listening, resume the music later.'
				);

				// Update the embed to let them know about it.
				await m?.edit(embed);

				// Delete the temporary value.
				return this.client.musica.feed.delete(`${newVC.guild.id}.d`);
			}, 6e4);
		} else if (newVC.members.size > 1 && serverQueue.player.paused) {
			// If there is at least one member in the voice channel now, then resume the music.
			await serverQueue.player.pause(false);

			// If there is no music feed channel, don't proceed.
			if (!channel) return undefined;

			// Get the message id.
			const id = this.client.musica.feed.get(`${newVC.guild.id}.d`);

			// Fetch the message.
			const m = await channel.messages.fetch(id);
			if (!m) return undefined;

			// Update the embed description to let them know that the music is resumed.
			embed.setDescription('Okie. I\'ve resumed the music for you! Enjoy 🎉');

			// Edit the embed.
			await m?.edit(embed);

			// Delete the temporary value.
			return this.client.musica.feed.delete(`${newVC.guild.id}.d`);
		}
		return undefined;
	}
}

module.exports = VoiceStateUpdateListener;
