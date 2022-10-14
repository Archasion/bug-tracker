import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
      SelectMenuInteraction,
      AttachmentBuilder,
      ActionRowBuilder,
      ButtonComponent,
      ButtonBuilder,
      EmbedBuilder,
      ButtonStyle,
      ActionRow
} from "discord.js";

import {SubmissionStatus, SubmissionType, BugPriority} from "../../data/Types";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

import Properties from "../../data/Properties";

const priorityImage = {
      medium: new AttachmentBuilder("assets/priority/Medium.png", { name: "medium.png" }),
      none: new AttachmentBuilder("assets/priority/None.png", { name: "none.png" }),
      high: new AttachmentBuilder("assets/priority/High.png", { name: "high.png" }),
      low: new AttachmentBuilder("assets/priority/Low.png", { name: "low.png" })
};

const statusImage = {
      considered: new AttachmentBuilder("assets/status/Considered.png", { name: "considered.png" }),
      approved: new AttachmentBuilder("assets/status/Approved.png", { name: "approved.png" }),
      rejected: new AttachmentBuilder("assets/status/Rejected.png", { name: "rejected.png" }),
      fixed: new AttachmentBuilder("assets/status/Fixed.png", { name: "fixed.png" })
};

export default class SetStatusSelectMenu extends SelectMenu {
      constructor(client: Bot) {
            super(client, {
                  name: { startsWith: "set-status" },
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
       * @param {SelectMenuInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: SelectMenuInteraction): Promise<void> {
            const messageId = interaction.customId.split("-")[2];
            const message = await interaction.channel?.messages.fetch(messageId);
            const status = interaction.values[0] as SubmissionStatus;

            if (!message) {
                  await interaction.editReply("Unable to retrieve original message.");
                  return;
            }

            const embed = message.embeds[0].toJSON();

            if (embed.author?.name.includes(status.toUpperCase())) {
                  await interaction.editReply(`This submission's status has already been set to **${status}**`);
                  return;
            }

            let type = embed.title;

            switch (type) {
                  case "Suggestion": {
                        type = "suggestions";
                        break;
                  }

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
                        [type as SubmissionType]: 1,
                        _id: 0
                  }
            );

            const submissionData = guildConfig?.[type as SubmissionType].find(submission => submission.messageId === messageId);
            const thumbnailFile: AttachmentBuilder[] = [];


            if (type === "bugs" && status === "none") {
                  const priority = submissionData.priority.toLowerCase() as BugPriority;

                  embed.author = { name: `Priority: ${priority.toUpperCase()}` };
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  embed.thumbnail!.url = `attachment://${priority}.png`;
                  embed.color = Properties.colors.priority[priority];

                  thumbnailFile.push(priorityImage[priority]);
            }


            const hasReasonField = embed.fields?.some(field => field.name === "Reason");
            if (hasReasonField) embed.fields?.pop();

            if (status !== "none") {
                  embed.author = {name: `Status: ${status.toUpperCase()} (By ${interaction.user.tag})`};
                  embed.color = Properties.colors.status[status as SubmissionStatus];

                  if (type === "bugs") {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        embed.thumbnail!.url = `attachment://${status}.png`;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        thumbnailFile.push(statusImage[status]);
                  }
            } else {
                  if (type !== "bugs") {
                        delete embed.author;
                        embed.color = Properties.colors.default;
                  }
            }

            message.edit({
                  embeds: [embed],
                  files: thumbnailFile
            }).then(async () => {
                  await interaction.editReply(`The submission status has successfully been set to **${status}**`);

                  if (guildConfig?.auto.dm.status && status !== "none") {
                        const submissionAuthor = await interaction.guild?.members.fetch(submissionData.author);
                        if (!submissionAuthor) return;

                        const dmEmbed = new EmbedBuilder()
                              .setColor(Properties.colors.status[status])
                              .setTitle(`Your ${type?.slice(0, -1)} with the ID of #${submissionData.number} has been ${status}`)
                              .setDescription(`The status of your submission has been updated by ${interaction.user} (\`${interaction.user.id}\`).`)
                              .setTimestamp();

                        const jumpUrl = new ButtonBuilder()
                              .setLabel("Jump to Submission")
                              .setStyle(ButtonStyle.Link)
                              .setURL(message.url);

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