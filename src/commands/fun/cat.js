const { Command } = require('discord-akairo');
const { Message, MessageEmbed, MessageReaction, User } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');

const { catBreeds: breedsData, countries: countriesData } = require('../../util/data');
const util = require('../../util/util');

class CatCommand extends Command {
	constructor() {
		super('cat', {
			aliases: ['cat'],
			optionFlags: ['--breed', '--b', '--country', '--c'],
			category: 'fun',
			description: {
				content: 'Get information about a cat breed.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				 */
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setDescription('This command is used to fetch information about a cat breed.')
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Get information about a random cat breed.')
						.addField(
							`\`@Julis ${this.aliases[0]} --breed "<breed>"\``,
							'Get information about a specific breed. [Add quotes for multi word breed names.]'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} --breed\``,
							'Get information about a specific breed. You will be prompted to name the breed.'
						)
						.addField(`\`@Julis ${this.aliases[0]} --breed list\``, 'Get the list of available breeds.')
						.addField(
							`\`@Julis ${this.aliases[0]} --country "<country>"\``,
							'Get information about a random breed from a specific country.' +
							' [Add quotes for multi word breed name]'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} --country\``,
							'Get information about a random breed from a specific country.' +
							' You will be prompted to name the country.'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} --country list\``, 'Get the list of available countries.'
						)
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {{breed:string, country:string}}
	 */
	*args(message) {
		const breedFlag = message.content.toLowerCase().includes('--b');
		const countryFlag = breedFlag ? false : message.content.toLowerCase().includes('--c');

		const breed = yield {
			match: 'option',
			type: 'lowercase',
			flag: ['--breed', '--b'],
			prompt: {
				start: 'Which breed would the cat belong to?',
				retry: 'I didn\'t catch the breed you entered. Could you try that again?',
				cancel: 'Okie. I will not send any cats.',
				optional: !breedFlag
			}
		};
		const country = yield {
			match: 'option',
			flag: ['--country', '--c'],
			prompt: {
				start: 'Which country would the cat belong to?',
				retry: 'I didn\'t catch the country of origin entered. Could you type that again?',
				cancel: 'Okie. I will not send any cats.',
				optional: !countryFlag
			},
			type: 'lowercase'
		};
		return { breed, country };
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {string} args.breed - The breed name to look for.
	 * @param {string} args.country - The country name/code to look for.
	 */
	async exec(message, { breed, country }) {
		// An error message in case if the arguments are invalid.
		let msg = '';
		const delay = () => new Promise(res => setTimeout(res, 250));

		// If the country argument is "list", send the list of available countries.
		if (country && country === 'list') {
			// Get the list of available countries from the data.
			const list = countriesData.map(c => c.country);

			// Paginate the list.
			const paginated = util.paginate(list);
			const emojis = ['1️⃣', '2️⃣'];

			// Add the first page to the embed.
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available countries:')
				.setDescription(`・${paginated.items[0].join('\n・')}`)
				.setTimestamp();

			// Send the embed and add reactions to it.
			const m = await message.channel.send(embed);
			for (const emoji of emojis) {
				await m.react(emoji);
				await delay();
			}

			// Listen to the reactions and change the page accordingly.
			try {
				await m.awaitReactions(
					/**
					 * @param {MessageReaction} r - The reaction.
					 * @param {User} u - The user.
					 * @returns {*} - The return value is not important for us here.
					 */
					async (r, u) => {
						// Ignore the reactions if they are made by other users.
						if (u.id !== message.author.id) return undefined;

						// Ignore the reactions if some other emojis are used.
						if (!emojis.includes(r.emoji.name)) return undefined;

						// According to our code structure, emoji index = page index.
						const index = emojis.indexOf(r.emoji.name);
						embed.setDescription(`・${paginated.items[index].join('\n・')}`);

						// Remove the reaction of the user for good UX.
						await r.users.remove(u);
						return m.edit('', embed);
					}, { time: 6e4, errors: ['time'] }
				);
			} catch {
				// Remove all reactions after time is up.
				return m.reactions.removeAll();
			}
			// End the code here.
			return undefined;
		}

		// If the breed argument is "list", send the list of available breeds.
		if (breed && breed === 'list') {
			// Get the list of breeds from the data.
			const list = breedsData.map(b => b.name);

			// Paginate the list.
			const paginated = util.paginate(list, 12);
			const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

			// Add the first page to the embed.
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available breeds:')
				.setDescription(`・${paginated.items[0].join('\n・')}`)
				.setTimestamp();

			// Send the embed and add reactions to it.
			const m = await message.channel.send(embed);
			for (const emoji of emojis) {
				await m.react(emoji);
				await delay();
			}

			// Listen to the reactions and change the page accordingly.
			try {
				await m.awaitReactions(
					/**
					 * @param {MessageReaction} r - The reaction.
					 * @param {User} u - The user.
					 * @returns {*} - The return value is not important for us here.
					 */
					async (r, u) => {
						// Ignore the reactions if they are made by other users.
						if (u.id !== message.author.id) return undefined;

						// Ignore the reactions if some other emojis are used.
						if (!emojis.includes(r.emoji.name)) return undefined;

						// According to our code structure, emoji index = page index.
						const index = emojis.indexOf(r.emoji.name);
						embed.setDescription(`・${paginated.items[index].join('\n・')}`);

						// Remove the reaction of the user for good UX.
						await r.users.remove(u);
						return m.edit('', embed);
					}, { time: 6e4, errors: ['time'] }
				);
			} catch {
				// Remove all reactions after the time is up.
				return m.reactions.removeAll();
			}
			// End the code here.
			return undefined;
		}

		/**
		 * @description
		 * @param {string} breed - The name of breed to look for.
		 * @param {string} country - The name of country to look for.
		 * @returns {string} - The breed ID or the country code.
		 */
		const getBreed = (breed, country) => {
			/**
			 * @description - Get a random breed id if the match fails.
			 * @param {'c'|'b'|'r'} origin - Where the match failed. Country or Breed.
			 * @returns {string} - The breed id.
			 */
			const getRandom = origin => {
				if (origin === 'c') msg = 'Sorry! I don\'t know about any cats from that country. ';
				else if (origin === 'b') msg = 'Sorry! I don\'t know about that cat breed. ';
				msg += 'Here\'s a random one.';

				return breedsData[Math.floor(Math.random() * breedsData.length)].id;
			};

			// If a country is mentioned, fetch a breed from that country.
			if (country) {
				let matchedCountry = undefined;
				for (const c of countriesData) {
					if (c.countryCode.toLowerCase() === country || c.country.toLowerCase() === country) {
						matchedCountry = c.countryCode;

						// Break the loop to save time.
						break;
					}
				}

				// If no countries are matched from the database, get a random one.
				if (!matchedCountry) return getRandom('c');

				// Get the list of all breeds from that particular country.
				const matchedBreeds = [];
				breedsData.forEach(b => {
					if (b.countryCode === matchedCountry) matchedBreeds.push(b);
				});

				// If there are no matched breeds from that country, return a random one.
				if (!matchedBreeds.length) return getRandom('c');

				// Return a random cat from the cat breeds of that country.
				return matchedBreeds[Math.floor(Math.random() * matchedBreeds.length)].id;
			}

			// Get random breed if no breed is specified, or if the breed is specified as random.
			if (!breed || ['random', 'ran'].includes(breed)) return getRandom('r');

			// Get the breed id if a breed is specified.
			for (const b of breedsData) {
				if (b.id === breed || b.name.toLowerCase() === breed) {
					return b.id;
				}
			}

			// If there are no returns yet, then the breed probably doesn't exist.
			return getRandom('b');
		};

		// We make an object of the query parameters for ease.
		const queryParams = {
			size: 'full',
			order: 'RANDOM',
			breed_id: getBreed(breed, country),
			limit: 1
		};

		// Here, we use query string to encode our query parameters to uri encoding and fetch the data from api.
		const data = await fetch(`https://api.thecatapi.com/v1/images/search?${qs.stringify(queryParams)}`, {
			method: 'GET',
			headers: { 'X-API_KEY': process.env.CAT_API_KEY }
		}).then(res => res.json());

		// Wikipedia logo for author image.
		const wikiLogo = 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/800px-Wikipedia-logo-v2.svg.png';

		// Set the fetched api data to an embed.
		const cat = new MessageEmbed();
		cat.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(`Breed - ${data[0].breeds[0].name} ↗`, wikiLogo, data[0].breeds[0].wikipedia_url)
			.setDescription(
				`${data[0].breeds[0].description}\n` +
				`**Temperament** - ${data[0].breeds[0].temperament}\n` +
				`**Average Lifespan** - ${data[0].breeds[0].life_span} years.\n` +
				`**Average Weight** - ${data[0].breeds[0].weight.metric} kg ` +
				`(${data[0].breeds[0].weight.imperial} lbs)\n` +
				`**Country** - ${data[0].breeds[0].origin} [${data[0].breeds[0].country_code}]`
			)
			.setImage(data[0].url)
			.setTimestamp();

		// Send the embed to the channel.
		return message.channel.send(msg, cat);
	}
}

module.exports = CatCommand;
