import EventListener from "../modules/listeners/Listener";
import Bot from "../Bot";

module.exports = class ReadyEventListener extends EventListener {
      declare client: Bot;

      constructor(client: Bot) {
            super(client, {
                  name: "ready",
                  once: true
            });
      }

      public static async execute(client: Bot) {
            console.log(`${client.user?.tag} is online!`);

            client.commands.load();
            client.commands.publish();
      }
}