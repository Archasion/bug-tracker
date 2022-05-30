// ANCHOR Constants
const express = require("express");
const yaml = require("js-yaml");
const fs = require("fs");
const app = express();
const port = 80;

const { path } = require("./utils/fs");

const fileContents = fs.readFileSync(path("/src/config.yaml"), "utf8");

process.title = "Bug Tracker";

global.config = yaml.load(fileContents);
global.log = require("./logger");

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => log.success(`Example app listening at http://localhost:${port}`));

require("dotenv").config({ path: path("./.env") });
require("./utils/functions")();
require("./mongodb")();

process.on("unhandledRejection", error => {
	if (error instanceof Error) log.warn(`Uncaught ${error.name} (${error.message})`);
	if (error.message !== "Missing Access") log.error(error);
});

const ListenerLoader = require("./modules/listeners/loader");
const CommandManager = require("./modules/commands/manager");
const ButtonManager = require("./modules/buttons/manager");
const DiscordUtils = require("./utils/discord");
const Cryptr = require("cryptr");

const { Client, GatewayIntentBits, Partials } = require("discord.js");

/**
 * The Discord client
 * @typedef {Bot} Bot
 * @extends {Client}
 */
class Bot extends Client {
	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildScheduledEvents
				// GatewayIntentBits.MessageContent
			],
			partials: [
				Partials.Channel,
				Partials.Message,
				Partials.Reaction,
				Partials.GuildMember,
				Partials.ThreadMember,
				Partials.GuildScheduledEvent,
				Partials.User
			]
		});

		(async () => {
			global.cryptr = new Cryptr(process.env.DB_ENCRYPTION_KEY);
			global.utils = new DiscordUtils(this);

			log.info("Connecting to Discord API...");

			this.commands = new CommandManager(this);
			this.buttons = new ButtonManager(this);

			const listeners = new ListenerLoader(this);
			listeners.load();

			this.setMaxListeners(config.maxListeners);
			this.login();
		})();
	}
}

// eslint-disable-next-line no-new
new Bot();
