module.exports = class FormattingUtils {
	/**
	 * Formats a number into a string with commas (if applicable).
	 * @param {number} numberToFormat - The number to format.
	 * @param {string|number} seperator - The number to format.
	 * @returns {string} The formatted number.
	 */
	addCommas(numberToFormat, seperator = ",") {
		return numberToFormat.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${seperator}`);
	}
};
