import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
      ChatInputCommandInteraction,
      ApplicationCommandType,
      SelectMenuBuilder,
      ActionRowBuilder
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class SubmitCommand extends Command {
      constructor(client: Bot) {
            super(client, {
                  name: "submit",
                  description: "Create a submission (bug report, player report or suggestion)",
                  restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
            });
      }

      /**
       * @param {ChatInputCommandInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const submissionType = new SelectMenuBuilder()
                  .setCustomId("submission-type")
                  .setPlaceholder("Select the submission type...")
                  .setOptions({
                        label: "Bug Report",
                        value: "bug-report"
                  },
                  {
                        label: "Player Report",
                        value: "player-report"
                  },
                  {
                        label: "Suggestion",
                        value: "suggestion"
                  });

            const actionRow = new ActionRowBuilder().setComponents(submissionType);

            await interaction.editReply({
                  content: "Please select the submission type:",
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  components: [actionRow.toJSON()]
            });
            return;
      }
}