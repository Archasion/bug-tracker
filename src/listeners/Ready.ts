import EventListener from "../modules/listeners/Listener";
import { Client } from "discord.js";

module.exports = class ReadyEventListener extends EventListener {
      constructor(client: Client) {
            super(client, {
                  name: "ready",
                  once: true
            });
      }

      public static async execute(client: Client) {
            console.log(`${client.user?.tag} is online!`);
      }
}