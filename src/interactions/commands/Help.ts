import Command from "../../modules/interactions/commands/Command";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

import Bot from "../../Bot";

export default class HelpCommand extends Command {
      constructor(client: Bot) {
            super(client, {
                  name: "help",
                  description: "Shows all commands",
                  restriction: RestrictionLevel.Public,
            });
      }

      async execute(interaction: ChatInputCommandInteraction, client: Client) {
            interaction.reply("Works!");
      }
}