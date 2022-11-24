import EventListener from "../modules/listeners/Listener";
import Guild from "../database/models/Guild.model";
import clc from "cli-color";
import Bot from "../Bot";

import {Guild as DiscordGuild} from "discord.js";

module.exports = class GuildDeleteEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {name: "guildDelete"});
    }

    public async execute(guild: DiscordGuild) {
        if (!guild) return;

        await Guild.deleteOne({_id: guild.id})
            .then(() => console.log("%s Removed guild configuration %s", clc.red("(GUILD DELETE)"), clc.blackBright(`("${guild.name}" • ${guild.id})`)))
            .catch(err => {
                console.log("%s Failed to remove guild configuration %s", clc.red("(GUILD DELETE)"), clc.blackBright(`("${guild.name}" • ${guild.id})`));
                console.error(err);
            });
    }
};