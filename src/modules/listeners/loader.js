const fs = require("fs");

/**
 * Manages the loading of event listeners
 */
module.exports = class ListenerLoader {
	/**
	 * Create a ListenerLoader instance
	 * @param {import('../..').Bot} client
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;
	}

	load() {
		const files = fs.readdirSync("src/listeners").filter(file => file.endsWith(".js"));

		for (let file of files) {
			try {
				file = require(`../../listeners/${file}`);
				// eslint-disable-next-line new-cap
				const listener = new file(this.client);
				const on = listener.once ? "once" : "on";
				if (listener.raw) {
					this.client.ws[on](listener.event, (...data) => listener.execute(...data));
				} else {
					this.client[on](listener.event, (...data) => listener.execute(...data));
				}
			} catch (e) {
				log.warn("An error occurred whilst loading a listener");
				log.error(e);
			}
		}
	}
};
