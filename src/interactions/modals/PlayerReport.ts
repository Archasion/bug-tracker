import Modal from "../../modules/interactions/modals/Modal";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
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

export default class ReportPlayerModal extends Modal {
      constructor(client: Bot) {
            super(client, {
                  name: "player-report",
                  restriction: RestrictionLevel.Public
            });
      }
      
      /**
       * @param  {ModalSubmitInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ModalSubmitInteraction): Promise<void> {
            const player = interaction.fields.getTextInputValue("player");
            const reason = interaction.fields.getTextInputValue("reason");

            const guildConfig = await Guild.findOne(
                  { id: interaction.guildId },
                  { 
                        ["channels.reports"]: 1,
                        reports: 1,
                        _id: 0 
                  }
            );

            const submissionChannelId = guildConfig?.channels.reports;

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
                        content: ErrorMessages.ChannelDoesntExist,
                        ephemeral: true
                  });
                  return;
            }

            if (!await PermissionUtils.botHasPermissions(interaction, [
                  "ReadMessageHistory",
                  "SendMessages",
                  "ViewChannel",
                  "EmbedLinks"
            ], submissionChannel)) return;

            const submissionId = guildConfig?.reports.length + 1;

            const embed = new EmbedBuilder()
                  .setColor(Properties.colors.default)
                  .setTitle("Player Report")
                  .setThumbnail(interaction.user.displayAvatarURL())
                  .setFields([
                        {
                              name: "Reported Player",
                              value: player,
                        },
                        {
                              name: "Report Reason",
                              value: reason,
                        }
                  ])
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

            const archiveButton = new ButtonBuilder()
                  .setCustomId("archive")
                  .setLabel("Archive")
                  .setStyle(ButtonStyle.Secondary);

            const actionRow = new ActionRowBuilder().setComponents(
                  approveButton, 
                  rejectButton,
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
                                    reports: {
                                          number: submissionId,
                                          messageId: message.id,
                                          author: interaction.user.id,
                                          player,
                                          reason
                                    }
                              } 
                        }
                  );

                  message.react(Properties.emojis.approve);
                  message.react(Properties.emojis.reject);

                  interaction.reply({
                        content: "Your player report has been submitted",
                        ephemeral: true
                  });
            });

            return;
      }
}