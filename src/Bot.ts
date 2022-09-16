import SelectMenuHandler from "./modules/interactions/select_menus/Manager";
import CommandHandler from "./modules/interactions/commands/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import ModalHandler from "./modules/interactions/modals/Manager";
import ListenerLoader from "./modules/listeners/Loader";
import clc from "cli-color";

import { Client, GatewayIntentBits, Partials } from "discord.js";

import "dotenv/config";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("./db/Manager")();

process.on("unhandledRejection", (error: Error) => {
      console.error(clc.red(error.stack));
});

export default class Bot extends Client {
      select_menus!: SelectMenuHandler;
      commands!: CommandHandler;
      buttons!: ButtonHandler;
      modals!: ModalHandler;

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
                  this.select_menus = new SelectMenuHandler(this);
                  this.commands = new CommandHandler(this);
                  this.buttons = new ButtonHandler(this);
                  this.modals = new ModalHandler(this);

                  const listeners = new ListenerLoader(this);
                  await listeners.load();
                  
                  await this.login(process.env.BOT_TOKEN);
            })();
      }
}

new Bot();