/**
 * A button
 */
module.exports = class Button {
	/**
	 * Create a new Button
	 * @param {import('../../').Bot} client - The Discord Client
	 * @param {Object} data - Button data
	 * @param {string} data.custom_id - The custom ID of the button (3-32)
	 * @param {number} [data.permission_level] - Restrict the command to certain permission levels
	 */
	constructor(client, data) {
		/** The Discord Client */
		this.client = client;

		/** The ButtonManager */
		this.manager = this.client.buttons;

		if (typeof data !== "object") {
			throw new TypeError(
				`Expected type of button "data" to be an object, got "${typeof data}"`
			);
		}

		/**
		 * The custom ID of the button
		 * @type {string}
		 */
		this.custom_id = data.custom_id;

		/**
		 * Restrict the button to certain permission levels
		 * @type {number}
		 */
		this.permission_level = data.permission_level;

		try {
			this.manager.register(this); // Register the button
		} catch (error) {
			log.error(error);
			return;
		}
	}
};
