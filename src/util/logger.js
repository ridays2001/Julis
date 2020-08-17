const winston = require('winston');

/*
 * Winston is a custom logger which is said to be faster than console.log.
 * My use case will be just for testing and decoration.
 */

// Here we set the colors for the logger. Using logger.info() would give cyan logs on console.
winston.addColors({
	err: 'red',
	warn: 'yellow',
	info: 'cyan',
	misc: 'greenBG',
	add: 'green',
	sub: 'magenta'
});

// Here is where the actual logger is created.
const logger = winston.createLogger({
	// We define the logging levels here. Lower level => more severe.
	levels: {
		err: 0,
		warn: 1,
		info: 2,
		misc: 3,
		add: 4,
		sub: 5
	},
	format: winston.format.combine(
		// We define the format of the logs. For example, "[INFO]: something"
		winston.format.printf(log => {
			if (typeof log.message === 'object') {
				return `[${log.level.toUpperCase()}]: ${JSON.stringify(log.message, undefined, 4)}`;
			}
			return `[${log.level.toUpperCase()}]: ${log.message}`;
		}),
		// This tells winston to colorize the entire text, rather than just the first part.
		winston.format.colorize({ all: true })
	),
	/*
	 * We tell winston to send the logs to the console.
	 * The level is the minimum level of the logs to display on the console.
	 * For more info, refer to https://npmjs.com/package/winston README section.
	 */
	transports: [new winston.transports.Console({ level: 'sub' })]
});

module.exports = logger;
