const { Listener } = require('discord-akairo');

class RawListener extends Listener {
	constructor() {
		super('raw', {
			emitter: 'client',
			event: 'raw'
		});
	}

	// Listen to the RAW event.
	exec(packet) {
		const event = packet.t;
		// Update voice states when they aren't emitted.
		if (event === 'VOICE_STATE_UPDATE') {
			if (packet.d.user_id !== process.env.ClientID) return undefined;
			this.client.music.voiceStateUpdate(packet.d);
		}

		// Update voice servers when they aren't emitted.
		if (event === 'VOICE_SERVER_UPDATE') this.client.music.voiceServerUpdate(packet.d);

		return undefined;
	}
}

module.exports = RawListener;
