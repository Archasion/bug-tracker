import Bot from "../../Bot";
import path from "path";
import fs from "fs";

export default class ListenerLoader {
      client: Bot;

      constructor(client: Bot) {
            this.client = client;
      }

      public async load() {
            const listenerFiles = fs.readdirSync(path.join(__dirname, "../../listeners")).filter(file => file.endsWith(".js"));

            for (const file of listenerFiles) {
                  const EventListener = require(path.join(__dirname, "../../listeners", file));
                  const listener = new EventListener(this.client);

                  if (listener.once) {
                        this.client.once(listener.name, (...args) => listener.execute(...args));
                  } else {
                        this.client.on(listener.name, (...args) => listener.execute(...args));
                  }
            }
      }
}