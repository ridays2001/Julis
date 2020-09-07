// cSpell: disable
const dogBreeds = [
	{
		id: 1,
		name: 'Affenpinscher',
		url: 'https://en.wikipedia.org/wiki/Affenpinscher',
		origin: 'Germany'
	},
	{
		id: 2,
		name: 'Afghan Hound',
		url: 'https://en.wikipedia.org/wiki/Afghan_Hound',
		origin: 'Afghanistan'
	},
	{
		id: 3,
		name: 'African Hunting Dog',
		url: 'https://en.wikipedia.org/wiki/African_wild_dog',
		origin: 'Africa' || undefined
	},
	{
		id: 4,
		name: 'Airedale Terrier',
		url: 'https://en.wikipedia.org/wiki/Airedale_Terrier',
		origin: 'England'
	},
	{
		id: 5,
		name: 'Akbash Dog',
		url: 'https://en.wikipedia.org/wiki/Akbash',
		origin: 'Turkey'
	},
	{
		id: 6,
		name: 'Akita',
		url: 'https://en.wikipedia.org/wiki/Akita_(dog)',
		origin: 'Japan'
	},
	{
		id: 7,
		name: 'Alapaha Blue Blood Bulldog',
		url: 'https://en.wikipedia.org/wiki/Alapaha_Blue_Blood_Bulldog',
		origin: 'United States'
	},
	{
		id: 8,
		name: 'Alaskan Husky',
		url: 'https://en.wikipedia.org/wiki/Sled_dog#Alaskan_husky',
		origin: 'United States'
	},
	{
		id: 9,
		name: 'Alaskan Malamute',
		url: 'https://en.wikipedia.org/wiki/Alaskan_Malamute',
		origin: 'United States'
	},
	{
		id: 10,
		name: 'American Bulldog',
		url: 'https://en.wikipedia.org/wiki/American_Bulldog',
		origin: 'United States'
	},
	{
		id: 11,
		name: 'American Bully',
		url: 'https://en.wikipedia.org/wiki/American_Bully',
		origin: 'United States'
	},
	{
		id: 12,
		name: 'American Eskimo Dog',
		url: 'https://en.wikipedia.org/wiki/American_Eskimo_Dog',
		origin: 'United States'
	},
	{
		id: 13,
		name: 'American Eskimo Dog (Miniature)',
		url: 'https://en.wikipedia.org/wiki/American_Eskimo_Dog',
		origin: 'Germany'
	},
	{
		id: 14,
		name: 'American Foxhound',
		url: 'https://en.wikipedia.org/wiki/American_Foxhound',
		origin: 'Unites States'
	},
	{
		id: 15,
		name: 'American Pit Bull Terrier',
		url: 'https://en.wikipedia.org/wiki/American_Pit_Bull_Terrier',
		origin: 'United States'
	},
	{
		id: 16,
		name: 'American Staffordshire Terrier',
		url: 'https://en.wikipedia.org/wiki/American_Staffordshire_Terrier',
		origin: 'United States'
	},
	{
		id: 17,
		name: 'American Water Spaniel',
		url: 'https://en.wikipedia.org/wiki/American_Water_Spaniel',
		origin: 'United States'
	},
	{
		id: 18,
		name: 'Anatolian Shepherd Dog',
		url: 'https://en.wikipedia.org/wiki/Anatolian_Shepherd',
		origin: 'Turkey'
	},
	{
		id: 19,
		name: 'Appenzeller Sennenhund',
		url: 'https://en.wikipedia.org/wiki/Appenzeller_Sennenhund',
		origin: 'Switzerland'
	},
	{
		id: 21,
		name: 'Australian Cattle Dog',
		url: 'https://en.wikipedia.org/wiki/Australian_Cattle_Dog',
		origin: 'Australia'
	},
	{
		id: 22,
		name: 'Australian Kelpie',
		url: 'https://en.wikipedia.org/wiki/Australian_Kelpie',
		origin: 'Australia'
	},
	{
		id: 23,
		name: 'Australian Shepherd',
		url: 'https://en.wikipedia.org/wiki/Australian_Shepherd',
		origin: 'United States'
	},
	{
		id: 24,
		name: 'Australian Terrier',
		url: 'https://en.wikipedia.org/wiki/Australian_Terrier',
		origin: 'Australia'
	},
	{
		id: 25,
		name: 'Azawakh',
		url: 'https://en.wikipedia.org/wiki/Azawakh',
		origin: 'Africa' || undefined
	},
	{
		id: 26,
		name: 'Barbet',
		url: 'https://en.wikipedia.org/wiki/Barbet_(dog)',
		origin: 'France'
	},
	{
		id: 28,
		name: 'Basenji',
		url: 'https://en.wikipedia.org/wiki/Basenji',
		origin: 'Africa' || undefined
	},
	{
		id: 29,
		name: 'Basset Bleu de Gascogne',
		url: 'https://en.wikipedia.org/wiki/Basset_Bleu_de_Gascogne',
		origin: 'France'
	},
	{
		id: 30,
		name: 'Basset Hound',
		url: 'https://en.wikipedia.org/wiki/Basset_Hound',
		origin: 'France'
	},
	{
		id: 31,
		name: 'Beagle',
		url: 'https://en.wikipedia.org/wiki/Beagle',
		origin: 'United Kingdom'
	},
	{
		id: 32,
		name: 'Bearded Collie',
		url: 'https://en.wikipedia.org/wiki/Bearded_Collie',
		origin: 'Scotland'
	},
	{
		id: 33,
		name: 'Beauceron',
		url: 'https://en.wikipedia.org/wiki/Beauceron',
		origin: 'France'
	},
	{ id: 34, name: 'Bedlington Terrier' },
	{ id: 36, name: 'Belgian Malinois' },
	{ id: 38, name: 'Belgian Tervuren' },
	{ id: 41, name: 'Bernese Mountain Dog' },
	{ id: 42, name: 'Bichon Frise' },
	{ id: 43, name: 'Black and Tan Coonhound' },
	{ id: 45, name: 'Bloodhound' },
	{ id: 47, name: 'Bluetick Coonhound' },
	{ id: 48, name: 'Boerboel' },
	{ id: 50, name: 'Border Collie' },
	{ id: 51, name: 'Border Terrier' },
	{ id: 53, name: 'Boston Terrier' },
	{ id: 54, name: 'Bouvier des Flandres' },
	{ id: 55, name: 'Boxer' },
	{ id: 56, name: 'Boykin Spaniel' },
	{ id: 57, name: 'Bracco Italiano' },
	{ id: 58, name: 'Briard' },
	{ id: 59, name: 'Brittany' },
	{ id: 61, name: 'Bull Terrier' },
	{ id: 62, name: 'Bull Terrier (Miniature)' },
	{ id: 64, name: 'Bullmastiff' },
	{ id: 65, name: 'Cairn Terrier' },
	{ id: 67, name: 'Cane Corso' },
	{ id: 68, name: 'Cardigan Welsh Corgi' },
	{ id: 69, name: 'Catahoula Leopard Dog' },
	{ id: 70, name: 'Caucasian Shepherd (Ovcharka)' },
	{ id: 71, name: 'Cavalier King Charles Spaniel' },
	{ id: 76, name: 'Chesapeake Bay Retriever' },
	{ id: 78, name: 'Chinese Crested' },
	{ id: 79, name: 'Chinese Shar-Pei' },
	{ id: 80, name: 'Chinook' },
	{ id: 81, name: 'Chow Chow' },
	{ id: 84, name: 'Clumber Spaniel', url: 'https://wikipedia.org/wiki/Clumber_Spaniel' },
	{ id: 86, name: 'Cocker Spaniel' },
	{ id: 87, name: 'Cocker Spaniel (American)' },
	{ id: 89, name: 'Coton de Tulear' },
	{ id: 92, name: 'Dalmatian' },
	{ id: 94, name: 'Doberman Pinscher' },
	{ id: 95, name: 'Dogo Argentino' },
	{ id: 98, name: 'Dutch Shepherd' },
	{ id: 101, name: 'English Setter' },
	{ id: 102, name: 'English Shepherd' },
	{ id: 103, name: 'English Springer Spaniel' },
	{ id: 104, name: 'English Toy Spaniel' },
	{ id: 105, name: 'English Toy Terrier' },
	{ id: 107, name: 'Eurasier' },
	{ id: 108, name: 'Field Spaniel' },
	{ id: 110, name: 'Finnish Lapphund' },
	{ id: 111, name: 'Finnish Spitz' },
	{ id: 113, name: 'French Bulldog' },
	{ id: 114, name: 'German Pinscher' },
	{ id: 115, name: 'German Shepherd Dog' },
	{ id: 116, name: 'German Shorthaired Pointer' },
	{ id: 119, name: 'Giant Schnauzer' },
	{ id: 120, name: 'Glen of Imaal Terrier' },
	{ id: 121, name: 'Golden Retriever', url: 'https://wikipedia.org/wiki/Golden_Retriever' },
	{ id: 123, name: 'Gordon Setter' },
	{ id: 124, name: 'Great Dane' },
	{ id: 125, name: 'Great Pyrenees' },
	{ id: 127, name: 'Greyhound', url: 'https://wikipedia.org/wiki/Greyhound' },
	{ id: 128, name: 'Griffon Bruxellois' },
	{ id: 129, name: 'Harrier' },
	{ id: 130, name: 'Havanese', url: 'https://wikipedia.org/wiki/Havanese_dog' },
	{ id: 134, name: 'Irish Setter', url: 'https://wikipedia.org/wiki/Irish_Setter' },
	{ id: 135, name: 'Irish Terrier' },
	{ id: 137, name: 'Irish Wolfhound' },
	{ id: 138, name: 'Italian Greyhound' },
	{ id: 140, name: 'Japanese Chin' },
	{ id: 141, name: 'Japanese Spitz' },
	{ id: 142, name: 'Keeshond', url: 'https://wikipedia.org/wiki/Keeshond' },
	{ id: 144, name: 'Komondor' },
	{ id: 145, name: 'Kooikerhondje' },
	{ id: 147, name: 'Kuvasz' },
	{ id: 149, name: 'Labrador Retriever' },
	{ id: 151, name: 'Lagotto Romagnolo' },
	{ id: 153, name: 'Lancashire Heeler' },
	{ id: 155, name: 'Leonberger' },
	{ id: 156, name: 'Lhasa Apso' },
	{ id: 161, name: 'Maltese' },
	{ id: 165, name: 'Miniature American Shepherd' },
	{ id: 167, name: 'Miniature Pinscher' },
	{ id: 168, name: 'Miniature Schnauzer' },
	{ id: 171, name: 'Newfoundland' },
	{ id: 172, name: 'Norfolk Terrier' },
	{ id: 176, name: 'Norwich Terrier' },
	{ id: 177, name: 'Nova Scotia Duck Tolling Retriever' },
	{ id: 178, name: 'Old English Sheepdog' },
	{ id: 179, name: 'Olde English Bulldogge' },
	{ id: 181, name: 'Papillon' },
	{ id: 183, name: 'Pekingese' },
	{ id: 184, name: 'Pembroke Welsh Corgi' },
	{ id: 185, name: 'Perro de Presa Canario' },
	{ id: 188, name: 'Pharaoh Hound' },
	{ id: 189, name: 'Plott' },
	{ id: 193, name: 'Pomeranian' },
	{ id: 196, name: 'Poodle (Miniature)' },
	{ id: 197, name: 'Poodle (Toy)' },
	{ id: 201, name: 'Pug' },
	{ id: 204, name: 'Puli' },
	{ id: 205, name: 'Pumi' },
	{ id: 207, name: 'Rat Terrier' },
	{ id: 208, name: 'Redbone Coonhound' },
	{ id: 209, name: 'Rhodesian Ridgeback' },
	{ id: 210, name: 'Rottweiler' },
	{ id: 211, name: 'Russian Toy' },
	{ id: 212, name: 'Saint Bernard' },
	{ id: 213, name: 'Saluki' },
	{ id: 214, name: 'Samoyed' },
	{ id: 216, name: 'Schipperke' },
	{ id: 218, name: 'Scottish Deerhound' },
	{ id: 219, name: 'Scottish Terrier' },
	{ id: 221, name: 'Shetland Sheepdog' },
	{ id: 222, name: 'Shiba Inu' },
	{ id: 223, name: 'Shih Tzu' },
	{ id: 225, name: 'Shiloh Shepherd' },
	{ id: 226, name: 'Siberian Husky' },
	{ id: 228, name: 'Silky Terrier' },
	{ id: 232, name: 'Smooth Fox Terrier' },
	{ id: 233, name: 'Soft Coated Wheaten Terrier' },
	{ id: 235, name: 'Spanish Water Dog' },
	{ id: 236, name: 'Spinone Italiano' },
	{ id: 238, name: 'Staffordshire Bull Terrier' },
	{ id: 239, name: 'Standard Schnauzer' },
	{ id: 242, name: 'Swedish Vallhund' },
	{ id: 243, name: 'Thai Ridgeback' },
	{ id: 244, name: 'Tibetan Mastiff' },
	{ id: 245, name: 'Tibetan Spaniel' },
	{ id: 246, name: 'Tibetan Terrier' },
	{ id: 248, name: 'Toy Fox Terrier' },
	{ id: 250, name: 'Treeing Walker Coonhound' },
	{ id: 251, name: 'Vizsla' },
	{ id: 253, name: 'Weimaraner' },
	{ id: 254, name: 'Welsh Springer Spaniel' },
	{ id: 256, name: 'West Highland White Terrier' },
	{ id: 257, name: 'Whippet' },
	{ id: 258, name: 'White Shepherd' },
	{ id: 259, name: 'Wire Fox Terrier' },
	{ id: 260, name: 'Wirehaired Pointing Griffon' },
	{ id: 261, name: 'Wirehaired Vizsla' },
	{ id: 262, name: 'Xoloitzcuintli' },
	{ id: 264, name: 'Yorkshire Terrier' }
];

const catBreeds = [
	{
	  id: 'abys',
	  name: 'Abyssinian',
	  country: 'Egypt',
	  countryCode: 'EG'
	},
	{ id: 'aege', name: 'Aegean', country: 'Greece', countryCode: 'GR' },
	{
	  id: 'abob',
	  name: 'American Bobtail',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'acur',
	  name: 'American Curl',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'asho',
	  name: 'American Shorthair',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'awir',
	  name: 'American Wirehair',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'amau',
	  name: 'Arabian Mau',
	  country: 'United Arab Emirates',
	  countryCode: 'AE'
	},
	{
	  id: 'amis',
	  name: 'Australian Mist',
	  country: 'Australia',
	  countryCode: 'AU'
	},
	{
	  id: 'bali',
	  name: 'Balinese',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'bamb',
	  name: 'Bambino',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'beng',
	  name: 'Bengal',
	  country: 'United States',
	  countryCode: 'US'
	},
	{ id: 'birm', name: 'Birman', country: 'France', countryCode: 'FR' },
	{
	  id: 'bomb',
	  name: 'Bombay',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'bslo',
	  name: 'British Longhair',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{
	  id: 'bsho',
	  name: 'British Shorthair',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{ id: 'bure', name: 'Burmese', country: 'Burma', countryCode: 'MM' },
	{
	  id: 'buri',
	  name: 'Burmilla',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{
	  id: 'cspa',
	  name: 'California Spangled',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'ctif',
	  name: 'Chantilly-Tiffany',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'char',
	  name: 'Chartreux',
	  country: 'France',
	  countryCode: 'FR'
	},
	{ id: 'chau', name: 'Chausie', country: 'Egypt', countryCode: 'EG' },
	{
	  id: 'chee',
	  name: 'Cheetoh',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'csho',
	  name: 'Colorpoint Shorthair',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'crex',
	  name: 'Cornish Rex',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{ id: 'cymr', name: 'Cymric', country: 'Canada', countryCode: 'CA' },
	{ id: 'cypr', name: 'Cyprus', country: 'Cyprus', countryCode: 'CY' },
	{
	  id: 'drex',
	  name: 'Devon Rex',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{ id: 'dons', name: 'Donskoy', country: 'Russia', countryCode: 'RU' },
	{
	  id: 'lihu',
	  name: 'Dragon Li',
	  country: 'China',
	  countryCode: 'CN'
	},
	{
	  id: 'emau',
	  name: 'Egyptian Mau',
	  country: 'Egypt',
	  countryCode: 'EG'
	},
	{
	  id: 'ebur',
	  name: 'European Burmese',
	  country: 'Burma',
	  countryCode: 'MM'
	},
	{
	  id: 'esho',
	  name: 'Exotic Shorthair',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'hbro',
	  name: 'Havana Brown',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{
	  id: 'hima',
	  name: 'Himalayan',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'jbob',
	  name: 'Japanese Bobtail',
	  country: 'Japan',
	  countryCode: 'JP'
	},
	{
	  id: 'java',
	  name: 'Javanese',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'khao',
	  name: 'Khao Manee',
	  country: 'Thailand',
	  countryCode: 'TH'
	},
	{ id: 'kora', name: 'Korat', country: 'Thailand', countryCode: 'TH' },
	{
	  id: 'kuri',
	  name: 'Kurilian',
	  country: 'Russia',
	  countryCode: 'RU'
	},
	{
	  id: 'lape',
	  name: 'LaPerm',
	  country: 'Thailand',
	  countryCode: 'TH'
	},
	{
	  id: 'mcoo',
	  name: 'Maine Coon',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'mala',
	  name: 'Malayan',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{
	  id: 'manx',
	  name: 'Manx',
	  country: 'Isle of Man',
	  countryCode: 'IM'
	},
	{
	  id: 'munc',
	  name: 'Munchkin',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'nebe',
	  name: 'Nebelung',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'norw',
	  name: 'Norwegian Forest Cat',
	  country: 'Norway',
	  countryCode: 'NO'
	},
	{
	  id: 'ocic',
	  name: 'Ocicat',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'orie',
	  name: 'Oriental',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'pers',
	  name: 'Persian',
	  country: 'Iran (Persia)',
	  countryCode: 'IR'
	},
	{
	  id: 'pixi',
	  name: 'Pixie-bob',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'raga',
	  name: 'Ragamuffin',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'ragd',
	  name: 'Ragdoll',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'rblu',
	  name: 'Russian Blue',
	  country: 'Russia',
	  countryCode: 'RU'
	},
	{
	  id: 'sava',
	  name: 'Savannah',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'sfol',
	  name: 'Scottish Fold',
	  country: 'United Kingdom',
	  countryCode: 'GB'
	},
	{
	  id: 'srex',
	  name: 'Selkirk Rex',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'siam',
	  name: 'Siamese',
	  country: 'Thailand',
	  countryCode: 'TH'
	},
	{
	  id: 'sibe',
	  name: 'Siberian',
	  country: 'Russia',
	  countryCode: 'RU'
	},
	{
	  id: 'sing',
	  name: 'Singapura',
	  country: 'Singapore',
	  countryCode: 'SP'
	},
	{
	  id: 'snow',
	  name: 'Snowshoe',
	  country: 'United States',
	  countryCode: 'US'
	},
	{ id: 'soma', name: 'Somali', country: 'Somalia', countryCode: 'SO' },
	{ id: 'sphy', name: 'Sphynx', country: 'Canada', countryCode: 'CA' },
	{
	  id: 'tonk',
	  name: 'Tonkinese',
	  country: 'Canada',
	  countryCode: 'CA'
	},
	{
	  id: 'toyg',
	  name: 'Toyger',
	  country: 'United States',
	  countryCode: 'US'
	},
	{
	  id: 'tang',
	  name: 'Turkish Angora',
	  country: 'Turkey',
	  countryCode: 'TR'
	},
	{
	  id: 'tvan',
	  name: 'Turkish Van',
	  country: 'Turkey',
	  countryCode: 'TR'
	},
	{
	  id: 'ycho',
	  name: 'York Chocolate',
	  country: 'United States',
	  countryCode: 'US'
	}
];

const countries = [
	{ countryCode: 'EG', country: 'Egypt' },
	{ countryCode: 'GR', country: 'Greece' },
	{ countryCode: 'US', country: 'United States' },
	{ countryCode: 'AE', country: 'United Arab Emirates' },
	{ countryCode: 'AU', country: 'Australia' },
	{ countryCode: 'FR', country: 'France' },
	{ countryCode: 'GB', country: 'United Kingdom' },
	{ countryCode: 'MM', country: 'Burma' },
	{ countryCode: 'CA', country: 'Canada' },
	{ countryCode: 'CY', country: 'Cyprus' },
	{ countryCode: 'RU', country: 'Russia' },
	{ countryCode: 'CN', country: 'China' },
	{ countryCode: 'JP', country: 'Japan' },
	{ countryCode: 'TH', country: 'Thailand' },
	{ countryCode: 'IM', country: 'Isle of Man' },
	{ countryCode: 'NO', country: 'Norway' },
	{ countryCode: 'IR', country: 'Iran (Persia)' },
	{ countryCode: 'SP', country: 'Singapore' },
	{ countryCode: 'SO', country: 'Somalia' },
	{ countryCode: 'TR', country: 'Turkey' }
];

const mediaKeywords = [
	'.png',
	'.webp',
	'.gif',
	'.mp4',
	'.mp3',
	'.jpg',
	'.jpeg',
	'.mkv',
	'.avi',
	'.wav',
	'.wma',
	'.ogg',
	'.aac',
	'.pdf',
	'.doc',
	'.docx',
	'.xls',
	'.xlsx',
	'.ppt',
	'.pptx',
	'.eps',
	'.tiff',
	'.bmp',
	'.heic',
	'.hief',
	'.flv',
	'.webm',
	'.wmv',
	'spotify',
	'soundcloud',
	'youtube',
	'twitter',
	'discordapp',
	'reddit',
	'instagram',
	'youtu.be',
	'tenor',
	'giphy'
];

const categories = {
	docs: {
		display: '<:docs:746623948552404993> Documentation Section',
		description: 'This section is for developers.' +
			' It allows them to quickly refer to various JavaScript documentation.',
		emoji: '746623948552404993',
		id: 'docs',
		/**
		 * @param {Message} msg - The member object.
		 * @returns {boolean} - Whether to include this category or not.
		 */
		validation: msg => {
			const modules = msg.client.uData.get(msg.author.id, 'modules', {});
			return modules.programmer || msg.client.isOwner(msg.author);
		}
	},
	fun: {
		display: '<:fun:746616697871401044> Fun Section',
		description: 'This section includes all fun commands which help relieve boredom.',
		emoji: '746616697871401044',
		id: 'fun',
		/**
		 * @returns {true} - Always show this category.
		 */
		validation: () => true
	},
	general: {
		display: '<:general:746616698152419418> General Section',
		description: 'This section has all the general bot-related commands.',
		emoji: '746616698152419418',
		id: 'general',
		/**
		 * @returns {true} - Always show this category.
		 */
		validation: () => true
	},
	judiciary: {
		display: '<:judiciary:746623948980092935> Judiciary Section',
		description: 'This section includes all the server judiciary commands.',
		emoji: '746623948980092935',
		id: 'judiciary',
		/**
		 * @returns {true} - Always show this category.
		 */
		validation: () => true
	},
	mod: {
		display: '<:mod:746623948728303687> Moderator Section',
		description: 'This section includes all the moderation commands for server moderation.',
		emoji: '746623948728303687',
		id: 'mod',
		/**
		 * @param {Message} msg - The message object.
		 * @returns {boolean} - Whether to include this category or not.
		 */
		validation: msg => msg.client.isOwner(msg.author) || msg.member?.permissions.has('MANAGE_GUILD')
	},
	owner: {
		display: '<:owner:746616698504872056> Owner Section',
		description: 'This section includes all commands which can only be used by my developers.' +
			' The commands provide full unristricted access to my system.',
		emoji: '746616698504872056',
		id: 'owner',
		/**
		 * @param {Message} msg - The message object.
		 * @returns {boolean} - Whether to include this category or not.
		 */
		validation: msg => msg.client.isOwner(msg.author)
	},
	music: {
		display: '<:music:749148099007610930> Music Section',
		description: 'This section includes all commands related to music.',
		emoji: '749148099007610930',
		id: 'music',
		/**
		 * @param {Message} msg - The message object.
		 * @returns {boolean} - Show this category only in guilds.
		 */
		validation: msg => {
			if (msg.guild) return true;
			return msg.client.isOwner(msg.author);
		}
	}
};


module.exports = {
	catBreeds,
	countries,
	dogBreeds,
	mediaKeywords,
	categories
};
