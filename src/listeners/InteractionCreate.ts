import EventListener from "../modules/listeners/Listener";
import { Client, CommandInteraction, Interaction, InteractionType } from "discord.js";

module.exports = class InteractionCreateEventListener extends EventListener {
      constructor(client: Client) {
            super(client, {
                  name: "interactionCreate",
                  once: false
            });
      }

      public static async execute(interaction: CommandInteraction) {
            if (interaction.type === InteractionType.ApplicationCommand) {
                  interaction.reply("Works!");
            }
      }
}