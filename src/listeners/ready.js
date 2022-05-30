const EventListener = require("../modules/listeners/listener");
const Guilds = require("../mongodb/models/guilds");

module.exports = class ReadyEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: "ready",
			once: true
		});
	}

	async execute() {
		// prettier-ignore
		log.success(`Connected to Discord as "${this.client.user.tag}" in ${this.client.guilds.cache.size} servers`);
		log.info("Loading commands");

		this.client.commands.load();
		this.client.commands.publish();

		this.client.buttons.load();

		this.client.guilds.cache.forEach(guild => {
			Guilds.findOne({ id: guild.id }, (err, settings) => {
				if (err) {
					log.error(err);
					return;
				}

				if (!settings) {
					const newGuild = new Guilds({ id: guild.id });
					newGuild.save().then(() => {
						log.info(
							`Created new guild configuration: ${guild.name} - ${guild.id}`
						);
					});
				}
			});
		});
	}
};
