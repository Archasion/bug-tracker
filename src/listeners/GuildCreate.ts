import EventListener from "../modules/listeners/Listener";
import Guild from "../database/models/Guild.model";
import clc from "cli-color";

import {Guild as DiscordGuild} from "discord.js";

export default class GuildCreateEventListener extends EventListener {
    constructor() {
        super({
            name: "guildCreate",
            once: false
        });
    }

    public async execute(guild: DiscordGuild) {
        const guildData = await Guild.findOne({_id: guild.id});

        if (!guildData) {
            const guildData = new Guild({_id: guild.id});
            await guildData
                .save()
                .then(() => console.log("%s Created a new guild configuration %s", clc.green("(GUILD CREATE)"), clc.blackBright(`("${guild.name}" • ${guild.id})`)));

            return;
        }

        console.log("%s Joined guild %s", clc.green("(GUILD CREATE)"), clc.blackBright(`("${guild.name}" • ${guild.id})`));
    }
};