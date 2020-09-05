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
		const oldVC = oldState.guild.me.voice?.channel;
		const newVC = newState.guild.me.voice?.channel;
		if (!oldVC || !newVC) return undefined;

		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(undefined, newVC.guild))
			.setAuthor(newVC.guild.name, newVC.guild.iconURL())
			.setTimestamp();

		const serverQueue = this.client.music.queues.get(newState.guild.id);
		const channel = this.client.channels.cache.get(this.client.musica.feed.get(oldState.guild.id));
		if (newVC.members.size <= 1 && serverQueue.player.playing) {
			await serverQueue.player.pause();

			if (!channel) return undefined;

			embed.setDescription(
				'The music channel is empty. I\'ve paused the music for this server.' +
				' Join again within one minute to automatically resume the music.'
			);

			const m = await channel.send(embed);
			this.client.musica.feed.set(`${newVC.guild.id}.d`, m.id);

			setTimeout(async () => {
				if (newVC.members.size > 1) return undefined;

				await serverQueue.player.leave();
				embed.setDescription(
					'Okie. It seems that nobody wants to listen to the music. I\'ll go ahead and take a break.' +
					' To continue listening, resume the music later.'
				);
				await m.edit(embed);
				return this.client.musica.feed.delete(`${newVC.guild.id}.d`);
			}, 6e4);
		} else if (newVC.members.size > 1 && !serverQueue.player.playing) {
			if (!serverQueue.player.paused) return undefined;
			await serverQueue.player.pause(false);

			if (!channel) return undefined;

			embed.setDescription('Okie. I\'ve resumed the music for you! Enjoy 🎉');

			const id = this.client.musica.feed.get(`${newVC.guild.id}.d`);
			const m = await channel.messages.fetch(id);
			await m.edit(embed);
			return this.client.musica.feed.delete(`${newVC.guild.id}.d`);
		}
		return undefined;
	}
}

module.exports = VoiceStateUpdateListener;
