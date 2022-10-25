import EventListener from "../modules/listeners/Listener";
import Guild from "../db/models/Guild.model";
import Properties from "../data/Properties";
import clc from "cli-color";
import Bot from "../Bot";

import {Guild as DiscordGuild} from "discord.js";

module.exports = class GuildDeleteEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {name: "guildDelete"});
    }

    public async execute(guild: DiscordGuild) {
        if (!guild) return;

        await Guild.deleteOne({id: guild.id})
            .then(() => console.log("%s Removed guild configuration %s", Properties.cli.listeners.guildDelete, clc.blackBright(`("${guild.name}" • ${guild.id})`)))
            .catch(err => {
                console.log("%s Failed to remove guild configuration %s", Properties.cli.listeners.guildDelete, clc.blackBright(`("${guild.name}" • ${guild.id})`));
                console.error(err);
            });
    }
};