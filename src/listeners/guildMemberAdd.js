const EventListener = require("../modules/listeners/listener");
const Guilds = require("../db/models/guilds");

module.exports = class GuildMemberAddEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "guildMemberAdd" });
	}

	async execute(member) {
		const settings = await Guilds.findOne({ id: member.guild.id });
		if (settings.auto.roles.length > 0) member.roles.add(settings.auto.roles);
	}
};
