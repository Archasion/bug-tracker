const EventListener = require("../modules/listeners/listener");
const Guilds = require("../db/models/guilds");

module.exports = class GuildDeleteEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "guildDelete" });
	}

	async execute(guild) {
		try {
			await Guilds.deleteOne({ id: guild.id }).then(() =>
				log.info(`Deleted guild configuration: ${guild.name} - ${guild.id}`)
			);
		} catch {
			log.warn(`Failed to delete guild configuration: ${guild.name} - ${guild.id}`);
		}
	}
};
