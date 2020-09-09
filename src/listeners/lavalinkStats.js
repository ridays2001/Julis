const { Listener } = require('discord-akairo');

class LavalinkStatsListener extends Listener {
	constructor() {
		super('lavalink-stats', {
			emitter: 'lavalink',
			event: 'stats'
		});
	}

	exec(data) {
		// Lavalink emits a stats event every minute. We listen to it and save the data.
		this.client.musica = {
			...this.client.musica,
			...data
		};
	}
}

module.exports = LavalinkStatsListener;
