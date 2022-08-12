import EventListener from "../modules/listeners/Listener";
import clc from "cli-color";
import Bot from "../Bot";

module.exports = class ReadyEventListener extends EventListener {
      constructor(client: Bot) {
            super(client, {
                  name: "ready",
                  once: true
            });
      }

      public async execute(client: Bot) {
            console.log(clc.green(`(EVENTS) ${client.user?.tag} is online!`));

            client.buttons.load();

            client.commands.load();
            client.commands.publish();
      }
};