import Modal from "../../modules/interactions/modals/Modal";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import { 
      ModalSubmitInteraction, 
      PermissionFlagsBits,
      APIEmbedField,
      EmbedBuilder,
      TextChannel,
      NewsChannel,
      Message
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

type SubmissionType = "bugs" | "reports" | "suggestions";

export default class SuggestModal extends Modal {
      constructor(client: Bot) {
            super(client, {
                  name: { startsWith: "edit" },
                  restriction: RestrictionLevel.Public
            });
      }
      
      /**
       * @param  {ModalSubmitInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ModalSubmitInteraction): Promise<void> {
            const args = interaction.customId.split("-");
            const type = args[1] as SubmissionType;
            const messageId = args[2];

            const guildConfig = await Guild.findOne(
                  { id: interaction.guildId }, 
                  { 
                        [`channels.${type}`]: 1,
                        [type]: 1,
                        _id: 0 
                  }
            );

            const submission = guildConfig?.[type].find(item => item.messageId === messageId);

            if (!submission) {
                  interaction.reply({
                        content: ErrorMessages.SubmissionNotFound,
                        ephemeral: true
                  });
                  return;
            }

            if (submission.author !== interaction.user.id) {
                  interaction.reply({
                        content: "Only the author of the submission can edit it.",
                        ephemeral: true
                  });
                  return;
            }

            const submissionChannelId = guildConfig?.channels[type];

            if (!submissionChannelId) {
                  interaction.reply({
                        content: ErrorMessages.ChannelNotConfigured,
                        ephemeral: true
                  });
                  return;
            }

            const submissionChannel = interaction.guild?.channels.cache.get(submissionChannelId) as TextChannel | NewsChannel;

            if (!submissionChannel) {
                  interaction.reply({
                        content: ErrorMessages.ChannelNotFound,
                        ephemeral: true
                  });
                  return;
            }

            if (!await PermissionUtils.botHasPermissions(interaction, [
                  PermissionFlagsBits.ViewChannel, 
                  PermissionFlagsBits.ReadMessageHistory
            ], submissionChannel)) return;

            const message = await submissionChannel.messages.fetch(messageId)
                  .catch(() => {
                        interaction.reply({
                              content: ErrorMessages.SubmissionNotFound,
                              ephemeral: true
                        });
                        return;
                  }) as Message;
            
            const [embed] = message.embeds;
            const newEmbed = new EmbedBuilder(embed.toJSON());

            const newFields: APIEmbedField[] = [];

            interaction.fields.fields.forEach(field => {
                  if (field.customId === "suggestion") {
                        newEmbed.setDescription(field.value);
                  } else {
                        newFields.push({
                              name: field.customId.replaceAll("-", " "),
                              value: field.value
                        });
                  }
            });

            if (newFields.length > 0) newEmbed.setFields(newFields);

            message.edit({
                  embeds: [newEmbed],
                  files: []
            }).then(() => {
                  interaction.reply({
                        content: "Successfully edited your submission!",
                        ephemeral: true
                  });
            });

            return;
      }
}