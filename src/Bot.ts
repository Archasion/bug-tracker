import CommandHandler from "./modules/interactions/commands/Manager";
import ListenerLoader from "./modules/listeners/Loader";

import { Client, GatewayIntentBits, Partials } from "discord.js";

require("dotenv").config();

export default class Bot extends Client {
      commands!: CommandHandler;

      constructor() {
            super({
                  intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMembers,
                        GatewayIntentBits.GuildMessages
                  ],
                  partials: [
                        Partials.Channel,
                        Partials.Message,
                        Partials.GuildMember,
                        Partials.ThreadMember,
                        Partials.User
                  ]
            });

            (async () => {
                  this.commands = new CommandHandler(this);

                  ListenerLoader.load(this);
                  this.login(process.env.BOT_TOKEN);
            })();
      }
}

new Bot();