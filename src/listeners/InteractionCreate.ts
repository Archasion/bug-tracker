import EventListener from "../modules/listeners/Listener";
import Bot from "../Bot";

import { Interaction, InteractionType } from "discord.js";

module.exports = class InteractionCreateEventListener extends EventListener {
      constructor(client: Bot) {
            super(client, { name: "interactionCreate" });
      }

      public async execute(interaction: Interaction) {
            if (interaction.isChatInputCommand()) {
                  this.client.commands.handle(interaction);
            }

            if (interaction.isButton()) {
                  this.client.buttons.handle(interaction);
            }

            if (interaction.type === InteractionType.ModalSubmit) {
                  this.client.modals.handle(interaction);
            }
      }
};