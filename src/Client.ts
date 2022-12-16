import SelectMenuHandler from "./modules/interactions/select_menus/Manager";
import CommandHandler from "./modules/interactions/commands/Manager";
import ButtonHandler from "./modules/interactions/buttons/Manager";
import ModalHandler from "./modules/interactions/modals/Manager";
import clc from "cli-color";
import "dotenv/config";

import {Client, GatewayIntentBits, Partials} from "discord.js";
import {loadListeners} from "./modules/listeners/Loader";

process.on("unhandledRejection", (error: Error) => console.error(error.stack));
process.on("uncaughtException", (error: Error) => console.error(error.stack));
require("./database/Manager");

class ClientManager {
    public selectMenus = new SelectMenuHandler();
    public commands = new CommandHandler();
    public buttons = new ButtonHandler();
    public modals = new ModalHandler();

    public client = new Client({
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
}

const manager = new ClientManager();
export default manager;

console.log("%s Starting client...", clc.greenBright(`(${process.env.NODE_ENV})`)); // test

(async () => {
    await loadListeners();
    await manager.client.login(process.env[`${process.env.NODE_ENV}_BOT_TOKEN`]);
})();