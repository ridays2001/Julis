const { Command } = require('discord-akairo');
const { Message, MessageEmbed, MessageReaction, User } = require('discord.js');
const fetch = require('node-fetch');
const qs = require('querystring');

const { dogBreeds: breedsData } = require('../../util/data');
const util = require('../../util/util');

class DogCommand extends Command {
	constructor() {
		super('dog', {
			aliases: ['dog'],
			optionFlags: ['--breed', '--b'],
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
						.addField(`\`@Julis ${this.aliases[0]}\``, 'Send information about a random dog breed.')
						.addField(
							`\`@Julis ${this.aliases[0]} --breed "<breed>"\``,
							'Get information about a specific dog breed. [Add quotes for multi word breed names.]'
						)
						.addField(
							`\`@Julis ${this.aliases[0]} --breed\``,
							'Get information about a specific dog breed. You will be prompted to name the breed.'
						)
						.addField(`\`@Julis ${this.aliases[0]} --breed list\``, 'Get the list of available dog breeds.')
						.setTimestamp();
					return guide;
				}
			}
		});
	}

	/**
	 * @param {Message} message - The message object.
	 * @returns {{breed:string}}
	 */
	*args(message) {
		const flag = message.content.toLowerCase().includes('--b');
		const breed = yield {
			match: 'option',
			flag: ['--breed', '--b'],
			type: 'lowercase',
			prompt: {
				start: 'Which breed would the dog belong to?',
				retry: 'I didn\'t catch the breed you entered. Could you try that again?',
				cancel: 'Okie. I will not send any dog.',
				optional: !flag
			}
		};
		return { breed };
	}

	/**
	 * @param {Message} message - The message object.
	 * @param {Object} args - The args object.
	 * @param {string} args.breed - The breed to look for.
	 */
	async exec(message, { breed }) {
		let err = undefined;

		// If the breed argument is "list", send the list of available breeds.
		if (breed === 'list') {
			const list = breedsData.map(b => b.name);
			const paginated = util.paginate(list, 29);
			const embed = new MessageEmbed();
			embed.setColor(this.client.prefColor(message.author, message.guild))
				.setTitle('List of available breeds:')
				.setDescription(`・${paginated.items[0].join('\n・')}`)
				.setTimestamp();

			// Some general stuff.
			const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
			const delay = () => new Promise(res => setTimeout(res, 250));

			// Send a message and add reactions to it.
			const m = await message.channel.send(embed);
			for (const emoji of emojis) {
				await m.react(emoji);
				await delay();
			}

			// Listen to the reactions and switch pages accordingly.
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

		/**
		 * @description - Convert breed resolvable data to breed id.
		 * @param {string} breed - The breed name or id.
		 * @returns {number} - The breed id.
		 */
		const getBreed = breed => {
			// Get a breed id if a breed is specified.
			for (const b of breedsData) {
				if (b.name.toLowerCase() === breed || b.id === parseInt(breed, 10)) return b.id;
			}

			// If there are no returns yet, then the breed probably doesn't exist.
			err = 'Sorry! I couldn\'t find that breed. Here\'s a random one.';
			return breedsData[Math.floor(Math.random() * breedsData.length)].id;
		};

		// We make an object of the query parameters for ease.
		const queryParams = {
			size: 'full',
			order: 'RANDOM',
			breed_id: getBreed(breed),
			limit: 1
		};

		// Here, we use query string to encode our query parameters to uri encoding and fetch the data from api.
		const data = await fetch(`https://api.thedogapi.com/v1/images/search?${qs.stringify(queryParams)}`, {
			method: 'GET',
			headers: { 'X-API_KEY': process.env.DOG_API_KEY }
		}).then(res => res.json());

		// Set the fetched api data to an embed.
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

		// Send the embed to the channel.
		return message.channel.send(err, embed);
	}
}

module.exports = DogCommand;
