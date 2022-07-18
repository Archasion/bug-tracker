import EventListener from "../modules/listeners/Listener";
import Bot from "../Bot";

import { CommandInteraction, InteractionType } from "discord.js";

module.exports = class InteractionCreateEventListener extends EventListener {
      constructor(client: Bot) {
            super(client, {
                  name: "interactionCreate",
                  once: false
            });
      }

      public async execute(interaction: CommandInteraction) {
            if (interaction.type === InteractionType.ApplicationCommand) {
                  this.client.commands.handle(interaction);
            }
      }
}