import EventListener from "../modules/listeners/Listener";
import Guild from "../db/models/Guild.model";
import Properties from "../data/Properties";
import clc from "cli-color";
import Bot from "../Bot";

import {Guild as DiscordGuild} from "discord.js";

module.exports = class GuildCreateEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {name: "guildCreate"});
    }

    public async execute(guild: DiscordGuild) {
        if (process.env.BLACKLISTED_GUILDS?.split(" ").includes(guild.id)) {
            await guild.leave();
            return;
        }

        const guildData = await Guild.findOne({_id: guild.id});

        if (!guildData) {
            const guildData = new Guild({_id: guild.id});
            await guildData
                .save()
                .then(() => console.log("%s Created a new guild configuration %s", Properties.cli.listeners.guildCreate, clc.blackBright(`("${guild.name}" • ${guild.id})`)));

            return;
        }

        console.log("%s Joined guild %s", Properties.cli.listeners.guildCreate, clc.blackBright(`("${guild.name}" • ${guild.id})`));
    }
};