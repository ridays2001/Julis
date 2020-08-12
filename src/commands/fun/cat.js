const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');

const { catBreeds: breedsData, countries: countriesData } = require('../../util/data');

class CatCommand extends Command {
	constructor() {
		super('cat', {
			aliases: ['cat'],
			args: [
				{
					id: 'breed',
					match: 'option',
					flag: ['--breed', '--b'],
					prompt: {
						start: 'Which breed would the cat belong to?',
						retry: 'I didn\'t catch the breed you entered. Could you try that again?',
						cancel: 'Okie. I will not send any cats.',
						optional: true
					},
					type: 'lowercase'
				},
				{
					id: 'country',
					match: 'option',
					flag: ['--country', '--c'],
					prompt: {
						start: 'Which country would the cat belong to?',
						retry: 'I didn\'t catch the country of origin entered. Could you type that again?',
						cancel: 'Okie. I will not send any cats.',
						optional: true
					},
					type: 'lowercase'
				}
			],
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
							`\`@Julis ${this.aliases[0]} --breed <breed>\``, 'Get information about a specific breed.'
						)
						.addField(`\`@Julis ${this.aliases[0]} --breed list\``, 'Get the list of available breeds.')
						.addField(
							`\`@Julis ${this.aliases[0]} --country <country>\``,
							'Get information about a random breed from a specific country.'
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
	 * @param {Object} args - The args object.
	 * @param {string} breed - The breed name to look for.
	 * @param {string} country - The country name/code to look for.
	 */
	async exec(message, { breed, country }) {
		// An error message in case if the arguments are invalid.
		let err = '';

		/* TO - DO : Fix This! */

		// If the country argument is "list", send the list of available countries.
		if (country && country === 'list') {
			const list = countriesData.map(c => c.country);
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available countries:')
				.setDescription(`-${list.join('\n-')}`)
				.setTimestamp();
			return message.channel.send(embed);
		}

		// If the breed argument is "list", send the list of available breeds.
		if (breed && breed === 'list') {
			const list = breedsData.map(b => b.name);
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available breeds:')
				.setDescription(`-${list.join('\n-')}`)
				.setTimestamp();
			return message.channel.send(embed);
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
				if (origin === 'c') err = 'Sorry! I don\'t know about any cats from that country. ';
				else if (origin === 'b') err = 'Sorry! I don\'t know about that cat breed. ';
				err += 'Here\'s a random one.';

				return breedsData[Math.floor(Math.random() * breedsData.length)].id;
			};
			// If a country is mentioned, fetch a breed from that country.
			if (country) {
				let matchedCountry = undefined;
				for (const c of countriesData) {
					if (c.countryCode.toLowerCase() === country || c.country.toLowerCase() === country) {
						matchedCountry = c.countryCode;
						break; // Break the loop to save time.
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

				/*
				* Here, we check if the program goes till the last index possible.
				* If there is a match, the program would never reach here.
				* So, it would mean that the entered breed does not exist.
				* We return a random breed in such scenario.
				*/
				if (breedsData.indexOf(b) === (breedsData.length - 1)) return getRandom('b');
			}
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

		// Send the fetched api data as an embed.
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
		return message.channel.send(err, cat);
	}
}

module.exports = CatCommand;