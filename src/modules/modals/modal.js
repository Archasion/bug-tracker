/**
 * A modal
 */
module.exports = class Modal {
	/**
	 * Create a new Modal
	 * @param {import('../../').Bot} client - The Discord Client
	 * @param {Object} data - Modal data
	 * @param {string} data.custom_id - The custom ID of the modal (3-32)
	 * @param {number} [data.permission_level] - Restrict the command to certain permission levels
	 */
	constructor(client, data) {
		/** The Discord Client */
		this.client = client;

		/** The ModalManager */
		this.manager = this.client.modals;

		if (typeof data !== "object") {
			throw new TypeError(
				`Expected type of modal "data" to be an object, got "${typeof data}"`
			);
		}

		/**
		 * The custom ID of the modal
		 * @type {Object|string}
		 */
		this.custom_id = data.custom_id;

		/**
		 * Restrict the modal to certain permission levels
		 * @type {number}
		 */
		this.permission_level = data.permission_level;

		try {
			this.manager.register(this); // Register the modal
		} catch (error) {
			log.error(error);
			return;
		}
	}
};
