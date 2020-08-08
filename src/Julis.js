// Set the environment variables from your .env file to the environment.
require('dotenv').config();

// Get the client object and create a new instance.
const Client = require('./client/JulisClient');
const client = new Client();

// Some basic listeners.
client.on('disconnect', () => console.log('[DISCONNECTED]'))
	.on('reconnect', () => console.log('[RECONNECTING]'))
	.on('error', err => console.log(err.message))
	.on('warn', warn => console.log(warn));
// Start the client (bot).
client.start();

// Report errors to sentry for tracking. For more info, visit https://sentry.io/
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY, environment: process.env.NODE_ENV });

// Listen to unhandled rejection error event.
process.on('unhandledRejection', err => {
	console.log(`[UNHANDLED REJECTION] ${err.message}`);
	console.log(err);
});

// Listen to warnings.
process.on('warning', warning => {
	console.log(warning.name);
	console.log(warning.message);
	console.log(warning.stack);
});
