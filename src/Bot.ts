import { Client, GatewayIntentBits, Partials } from "discord.js";
import ListenerLoader from "./modules/listeners/Loader";

require("dotenv").config();

const client = new Client({
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

ListenerLoader.load(client);

client.login(process.env.BOT_TOKEN);