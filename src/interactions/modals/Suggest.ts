import Modal from "../../modules/interactions/modals/Modal";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import StringUtils from "../../utils/StringUtils";
import Guild from "../../db/models/Guild.model";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import { 
      ModalSubmitInteraction, 
      ActionRowBuilder, 
      ButtonComponent, 
      ButtonBuilder, 
      EmbedBuilder, 
      ButtonStyle,
      TextChannel, 
      NewsChannel,
      ActionRow
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class SuggestModal extends Modal {
      constructor(client: Bot) {
            super(client, {
                  name: "suggest",
                  restriction: RestrictionLevel.Public
            });
      }
      
      /**
       * @param  {ModalSubmitInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ModalSubmitInteraction): Promise<void> {
            const suggestion = interaction.fields.getTextInputValue("suggestion");

            const guildConfig = await Guild.findOne(
                  { id: interaction.guildId },
                  { 
                        ["auto.threads.suggestions"]: 1,
                        ["channels.suggestions"]: 1,
                        suggestions: 1,
                        _id: 0 
                  }
            );

            const submissionChannelId = guildConfig?.channels.suggestions;

            if (!submissionChannelId) {
                  interaction.reply({
                        content: ErrorMessages.ChannelNotConfigured,
                        ephemeral: true,
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
                  "CreatePublicThreads",
                  "ReadMessageHistory",
                  "UseExternalEmojis", 
                  "ManageThreads",
                  "SendMessages",
                  "AddReactions",
                  "ViewChannel",
                  "EmbedLinks"
            ], submissionChannel)) return;

            const submissionId = guildConfig?.suggestions.length + 1;

            const embed = new EmbedBuilder()
                  .setColor(Properties.colors.default)
                  .setTitle("Suggestion")
                  .setDescription(suggestion)
                  .setThumbnail(interaction.user.displayAvatarURL())
                  .setFooter({ text: `#${submissionId}` })
                  .setTimestamp();

            const approveButton = new ButtonBuilder()
                  .setCustomId("approve")
                  .setLabel("Approve")
                  .setStyle(ButtonStyle.Success);

            const rejectButton = new ButtonBuilder()
                  .setCustomId("reject")
                  .setLabel("Reject")
                  .setStyle(ButtonStyle.Danger);

            const discussionThreadButton = new ButtonBuilder()
                  .setCustomId("discussion-thread")
                  .setLabel("Discussion Thread")
                  .setStyle(ButtonStyle.Secondary);

            const archiveButton = new ButtonBuilder()
                  .setCustomId("archive")
                  .setLabel("Archive")
                  .setStyle(ButtonStyle.Secondary);

            const actionRow = new ActionRowBuilder().setComponents(
                  approveButton, 
                  rejectButton, 
                  discussionThreadButton, 
                  archiveButton
            );

            submissionChannel.send({
                  content: `${interaction.user} (\`${interaction.user.id}\`)`,
                  embeds: [embed],
                  components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
            }).then(async (message) => {
                  await Guild.updateOne(
                        { id: interaction.guildId },
                        { 
                              $push: {
                                    suggestions: {
                                          number: submissionId,
                                          messageId: message.id,
                                          author: interaction.user.id,
                                          suggestion
                                    }
                              } 
                        }
                  );

                  message.react(Properties.emojis.approve);
                  message.react(Properties.emojis.reject);

                  if (guildConfig?.auto.threads.suggestions) {
                        message.startThread({
                              name: StringUtils.elipsify(suggestion, 100),
                              autoArchiveDuration: 10080, // 1 week
                              reason: "Submission discussion thread"
                        });
                  }

                  interaction.reply({
                        content: "Your suggestion has been submitted",
                        ephemeral: true
                  });
            });

            return;
      }
}