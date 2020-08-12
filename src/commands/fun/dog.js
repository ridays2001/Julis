const { Command } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');

const { dogBreeds: breedsData } = require('../../util/data');

class DogCommand extends Command {
	constructor() {
		super('dog', {
			aliases: ['dog'],
			args: [
				{
					id: 'breed',
					match: 'option',
					flag: ['--breed', '--b'],
					prompt: {
						start: 'Which breed would the dog belong to?',
						retry: 'I didn\'t catch the breed you entered. Could you try that again?',
						cancel: 'Okie. I will not send any dog.',
						optional: true
					},
					type: 'lowercase'
				}
			],
			category: 'fun',
			description: {
				content: 'Gets information about a dog breed.',
				/**
				 * @description - A function to send an embed guide for the command.
				 * @param {Message} message - The message object.
				 * @returns {MessageEmbed} - The guide as an embed.
				*/
				guide: message => {
					const guide = new MessageEmbed();
					guide.setColor(this.client.prefColor(message.author, message.guild))
						.setTitle(`Guide to use **${this.id}** command.`)
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {string} args.breed - The breed to look for.
	 */
	async exec(message, { breed }) {
		let err = undefined;

		/* TO - DO : Fix this! */
		// If the breed argument is "list", send the list of available breeds.
		if (breed === 'list') {
			const list = breedsData.map(b => b.name);
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available breeds:')
				.setDescription(`-${list.join('\n-')}`)
				.setTimestamp();
			return message.channel.send(embed);
		}

		/**
		 * @description - Convert breed resolvable data to breed id.
		 * @param {string} breed - The breed name or id.
		 * @returns {number} - The breed id.
		 */
		const getBreed = breed => {
			if (!breed || ['ran', 'random'].includes(breed)) {
				return breedsData[Math.floor(Math.random() * breedsData.length)].id;
			}

			for (const b of breedsData) {
				if (b.name.toLowerCase() === breed || b.id === parseInt(breed, 10)) return b.id;
			}

			err = 'Sorry! I couldn\'t find that breed. Here\'s a random one.';
			return breedsData[Math.floor(Math.random() * breedsData.length)].id;
		};

		const queryParams = {
			'size': 'full',
			'order': 'RANDOM',
			'breed_id': getBreed(breed),
			'limit': 1
		};

		const data = await fetch(`https://api.thedogapi.com/v1/images/search?${qs.stringify(queryParams)}`, {
			method: 'GET',
			headers: { 'X-API_KEY': process.env.DOG_API_KEY }
		}).then(res => res.json());

		const embed = new MessageEmbed();
		embed.setColor(this.client.prefColor(message.author, message.guild))
			.setAuthor(data[0].breeds[0].name)
			.setDescription(
				`**Temperament** - ${data[0].breeds[0].temperament}\n` +
				`**Average Lifespan** - ${data[0].breeds[0].life_span} years.\n` +
				`**Average Weight** - ${data[0].breeds[0].weight.metric} kg ` +
				`(${data[0].breeds[0].weight.imperial} lbs)\n`
			)
			.setImage(data[0].url)
			.setTimestamp();
		return message.channel.send(err, embed);
	}
}

module.exports = DogCommand;
