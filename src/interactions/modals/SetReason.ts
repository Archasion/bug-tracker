import Modal from "../../modules/interactions/modals/Modal";
import Bot from "../../Bot";

import { RestrictionLevel } from "../../utils/RestrictionUtils";
import { ModalSubmitInteraction } from "discord.js";

export default class SetReasonModal extends Modal {
      constructor(client: Bot) {
            super(client, {
                  name: { startsWith: "set-reason" },
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
       * @param  {ModalSubmitInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ModalSubmitInteraction): Promise<void> {
            const messageId = interaction.customId.split("-")[2];
            const submission = await interaction.channel?.messages.fetch(messageId);

            if (!submission) {
                  await interaction.editReply("Unable to retrieve original message.");
                  return;
            }

            const embed = submission.embeds[0]?.toJSON();
            const hasReason = embed?.fields?.some(field => field.name === "Reason");

            if (!embed.fields) embed.fields = [];
            if (hasReason) embed.fields?.pop();

            const reason = interaction.fields.getTextInputValue("reason");
            embed.fields?.push({ name: "Reason", value: reason });

            submission.edit({
                  embeds: [embed],
                  files: []
            }).then(async () => {
                  await interaction.editReply("Successfully updated the submission status reason!");
            });
            return;
      }
}