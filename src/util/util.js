module.exports = {
	/**
	 * @description - A function to paginate long arrays into shorter ones.
	 * @param {Array} collection - The array to paginate.
	 * @param {number} [pageLength = 10] - The number of items per page.
	 * @returns {{items:Array<Array>, pages:number, pageLength:number}} - The paginated data.
	 */
	paginate: (collection, pageLength = 10) => {
		const pages = Math.ceil(collection.length / pageLength);
		let startIndex = 0;
		const items = [];
		for (let i = 0; i < pages; i++) {
			items.push(collection.slice(startIndex, startIndex + pageLength));
			startIndex += pageLength;
		}
		return { items, pages, pageLength };
	}
};
