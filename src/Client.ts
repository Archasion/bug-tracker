import SelectMenuHandler from "./modules/interactions/select_menus/Manager";
import CommandHandler from "./modules/interactions/commands/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import ModalHandler from "./modules/interactions/modals/Manager";
import ListenerLoader from "./modules/listeners/Loader";
import "dotenv/config";

import {Client, GatewayIntentBits, Partials} from "discord.js";
import clc from "cli-color";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("./database/Manager")();

process.on("unhandledRejection", (error: Error) => console.error(error.stack));
process.on("uncaughtException", (error: Error) => console.error(error.stack));

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds
    ],
    partials: [
        Partials.ThreadMember,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.User
    ],
});

const listeners = new ListenerLoader(client);

export const SelectMenuManager = new SelectMenuHandler(client);
export const CommandManager = new CommandHandler(client);
export const ButtonManager = new ButtonHandler(client);
export const ModalManager = new ModalHandler(client);

console.log("%s Starting client...", clc.greenBright(`(${process.env.NODE_ENV})`));

(async () => {
    await listeners.load();
    await client.login(process.env[`${process.env.NODE_ENV}_BOT_TOKEN`]);
})();