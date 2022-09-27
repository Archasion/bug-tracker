import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
      SelectMenuInteraction,
      SelectMenuBuilder,
      ActionRowBuilder,
      TextInputBuilder,
      TextInputStyle,
      ModalBuilder
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class SubmissionTypeSelectMenu extends SelectMenu {
      constructor(client: Bot) {
            super(client, {
                  name: "submission-type",
                  restriction: RestrictionLevel.Public,
                  modalResponse: true
            });
      }

      /**
       * @param {SelectMenuInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: SelectMenuInteraction): Promise<void> {
            const [submissionType] = interaction.values;
            const modalComponents = [];

            if (submissionType === "bug-report") {
                  const submissionChannel = await Guild.findOne({ id: interaction.guildId }, { ["channels.bugs"]: 1, _id: 0 });

                  if (!submissionChannel) {
                        await interaction.reply(ErrorMessages.ChannelNotConfigured);
                        return;
                  }

                  const bugPriority = new SelectMenuBuilder()
                        .setCustomId("bug-priority")
                        .setPlaceholder("Select the bug priority...")
                        .setOptions([
                              {
                                    label: "None",
                                    value: "none",
                              },
                              {
                                    label: "Low",
                                    value: "low",
                              },
                              {
                                    label: "Medium",
                                    value: "medium",
                              },
                              {
                                    label: "High",
                                    value: "high",
                              }
                        ]);

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const disabledSubmissionType = new SelectMenuBuilder(interaction.component.toJSON());
                  disabledSubmissionType.setDisabled(true);

                  const priorityActionRow = new ActionRowBuilder().setComponents(bugPriority);
                  const typeActionRow = new ActionRowBuilder().setComponents(disabledSubmissionType);

                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  await interaction.update({ components: [typeActionRow, priorityActionRow] });

                  // await interaction.message.edit({ components: interaction.message.components });
                  return;
            }

            if (submissionType === "suggestion") {
                  const submissionChannel = await Guild.findOne({ id: interaction.guildId }, { ["channels.suggestions"]: 1, _id: 0 });

                  if (!submissionChannel) {
                        await interaction.reply(ErrorMessages.ChannelNotConfigured);
                        return;
                  }

                  const suggestionInput = new TextInputBuilder()
                        .setCustomId("suggestion")
                        .setLabel("Suggestion")
                        .setPlaceholder("Enter your suggestion...")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue("");

                  modalComponents.push(new ActionRowBuilder().addComponents(suggestionInput) as ActionRowBuilder<TextInputBuilder>);
            }

            if (submissionType === "player-report") {
                  const submissionChannel = await Guild.findOne({ id: interaction.guildId }, { ["channels.reports"]: 1, _id: 0 });

                  if (!submissionChannel) {
                        await interaction.reply(ErrorMessages.ChannelNotConfigured);
                        return;
                  }

                  modalComponents.push(
                        new ActionRowBuilder().addComponents(
                              new TextInputBuilder()
                                    .setCustomId("player")
                                    .setLabel("Player to Report")
                                    .setMinLength(1)
                                    .setMaxLength(1024)
                                    .setPlaceholder("e.g. John Doe")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue("")
                        ) as ActionRowBuilder<TextInputBuilder>,

                        new ActionRowBuilder().addComponents(
                              new TextInputBuilder()
                                    .setCustomId("reason")
                                    .setLabel("Reason")
                                    .setMinLength(12)
                                    .setMaxLength(1024)
                                    .setPlaceholder("The reason is...")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setValue("")
                        ) as ActionRowBuilder<TextInputBuilder>
                  );
            }

            const modal = new ModalBuilder()
                  .setCustomId(submissionType)
                  .setTitle(submissionType === "suggestion" ? "Suggestion" : "Player Report")
                  .addComponents(modalComponents);

            await interaction.showModal(modal);
            return;
      }
}