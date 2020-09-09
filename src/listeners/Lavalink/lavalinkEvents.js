const { Listener } = require('discord-akairo');

const musicFeed = require('./trackEnded');
const logger = require('../../util/logger');

class LavalinkEventsListener extends Listener {
	constructor() {
		super('lavalink-events', {
			emitter: 'lavalink',
			event: 'event'
		});
	}

	exec(data) {
		// Lavalink emits only one event for everything. We've to separate the events ourselves.
		const { type, reason } = data;

		// Log basic info of all events.
		logger.lavalink(`${type} :: ${reason}`);

		// Reset the votes to prevent chaos.
		if (type === 'TrackEndEvent') this.client.musica.votes.delete(data.guildId);

		// If a track ends with finished, it means that the song ended. Time to send out music feeds.
		if (type === 'TrackEndEvent' && reason === 'FINISHED') return musicFeed(data, this.client);

		// Don't do anything else.
		return undefined;
	}
}

module.exports = LavalinkEventsListener;
