import { Client } from "discord.js";
import path from "path";
import fs from "fs";

export default class ListenerLoader {
      public static async load(client: Client) {
            const listenerFiles = fs.readdirSync(path.join(__dirname, "../../listeners")).filter(file => file.endsWith(".js"));

            for (const file of listenerFiles) {
                  const EventListener = require(path.join(__dirname, "../../listeners", file));
                  const data = new EventListener(client);

                  if (data.once) {
                        client.once(data.name, (...args) => EventListener.execute(...args));
                  } else {
                        client.on(data.name, (...args) => EventListener.execute(...args));
                  }
            }
      }
}