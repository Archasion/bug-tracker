import EventListener from "../modules/listeners/Listener";
import Properties from "../data/Properties";
import Bot from "../Bot";

module.exports = class ReadyEventListener extends EventListener {
      constructor(client: Bot) {
            super(client, {
                  name: "ready",
                  once: true
            });
      }

      public async execute(client: Bot) {
            console.log("%s %s is online!", Properties.cli.listeners.ready, client.user?.tag);

            client.buttons.load();
            client.modals.load();

            client.commands.load();
            client.commands.publish();
      }
};