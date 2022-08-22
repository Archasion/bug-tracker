import Button from "../../modules/interactions/buttons/Button";
import Properties from "../../data/Properties";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import { 
      ButtonInteraction, 
      AttachmentBuilder, 
      ActionRowBuilder, 
      ButtonComponent, 
      ButtonBuilder, 
      EmbedBuilder,
      ButtonStyle, 
      ActionRow
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";
import { SubmissionType } from "../../data/Types";

export default class RejectButton extends Button {
      constructor(client: Bot) {
            super(client, {
                  name: "reject",
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
	 * @param {ButtonInteraction} interaction
	 * @returns {Promise<void>}
	 */
      async execute(interaction: ButtonInteraction): Promise<void> {
            const embed = interaction.message.embeds[0].toJSON();
            const thumbnailFile: AttachmentBuilder[] = [];

            let type: SubmissionType = "suggestions";

            switch (embed.title) {
                  case "Bug Report": {
                        type = "bugs";
                        break;
                  }

                  case "Player Report": {
                        type = "reports";
                        break;
                  }
            }

            const guildConfig = await Guild.findOne(
                  { id: interaction.guildId }, 
                  { 
                        ["auto.dm.status"]: 1,
                        [type]: 1,
                        _id: 0 
                  }
            );

            const isValid = guildConfig?.[type].some(report => report.messageId === interaction.message.id);

            if (!isValid) {
                  interaction.editReply(`This ${type.slice(0, -1)} is not located in the database.`);
                  return;
            }

            const submissionData = guildConfig?.[type].find(report => report.messageId === interaction.message.id);

            const hasReasonField = embed.fields?.some(field => field.name === "Reason");
            if (hasReasonField) embed.fields?.pop();

            if (embed.title === "Bug Report") {
                  const rejectedImage = new AttachmentBuilder("assets/status/Rejected.png", { name: "rejected.png" });
                  thumbnailFile.push(rejectedImage);

                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  embed.thumbnail!.url = "attachment://rejected.png";
            }

            embed.color = Properties.colors.status.rejected;
            embed.author = { name: `Status: REJECTED (By ${interaction.user.tag})` };

            const buttons = interaction.message.components[0].components.map(button => new ButtonBuilder(button.toJSON()));

            buttons[0].setDisabled(false);
            buttons[1].setDisabled(true);

            const actionRow = new ActionRowBuilder().setComponents(...buttons);

            interaction.message.edit({
                  embeds: [embed],
                  files: thumbnailFile,
                  components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
            }).then(async () => {
                  interaction.editReply(`Set the status of **${type.slice(0, -1)}** \`${embed.footer?.text}\` to **rejected**.`);

                  if (guildConfig?.auto.dm.status) {
                        const submissionAuthor = await interaction.guild?.members.fetch(submissionData.author);
                        if (!submissionAuthor) return;

                        const dmEmbed = new EmbedBuilder()
                              .setColor(Properties.colors.status.rejected)
                              .setTitle(`Your ${type.slice(0, -1)} with the ID of ${embed.footer?.text} has been rejected`)
                              .setDescription(`The status of your submission has been updated by ${interaction.user} (\`${interaction.user.id}\`).`)
                              .setTimestamp();

                        const jumpUrl = new ButtonBuilder()
                              .setLabel("Jump to Submission")
                              .setStyle(ButtonStyle.Link)
                              .setURL(interaction.message.url);

                        const urlActionRow = new ActionRowBuilder().setComponents(jumpUrl);

                        submissionAuthor.send({
                              embeds: [dmEmbed],
                              components: [urlActionRow.toJSON() as ActionRow<ButtonComponent>]
                        }).catch(() => console.log("Unable to DM submission author."));
                  }
            });

            return;
      } 
}