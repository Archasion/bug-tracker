const EventListener = require("../modules/listeners/listener");
const Guilds = require("../db/models/guilds");

module.exports = class GuildCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "guildCreate" });
	}

	async execute(guild) {
		this.client.commands.publish(guild);

		await Guilds.findOne({ id: guild.id }, (err, settings) => {
			if (err) {
				log.error(err);
				return;
			}

			if (!settings) {
				const newGuild = new Guilds({ id: guild.id });
				newGuild.save().then(() => {
					log.info(`Created new guild configuration: ${guild.name} - ${guild.id}`);
				});
			}
		});
	}
};
