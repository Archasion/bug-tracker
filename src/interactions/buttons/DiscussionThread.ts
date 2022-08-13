import Button from "../../modules/interactions/buttons/Button";
import PermissionUtils from "../../utils/PermissionUtils";
import Properties from "../../data/Properties";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { 
      ButtonInteraction, 
      ActionRowBuilder, 
      ButtonComponent,
      ButtonBuilder, 
      EmbedBuilder, 
      ButtonStyle, 
      ActionRow
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class DiscussionThreadButton extends Button {
      constructor(client: Bot) {
            super(client, {
                  name: "report-discussion-thread", // TODO Change to "discussion-thread"
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
	 * @param {ButtonInteraction} interaction
	 * @returns {Promise<void>}
	 */
      async execute(interaction: ButtonInteraction): Promise<void> {
            if (interaction.message.hasThread) {
                  interaction.editReply("This message already has a thread attached.");
                  return;
            }

            if (!await PermissionUtils.botHasPermissions(interaction, ["CreatePublicThreads", "ViewChannel"])) return;

            const [embed] = interaction.message.embeds;
            let threadName = embed.fields[0].value;

            threadName = threadName.length > 97 ? threadName.substring(0, 97) + "..." : threadName;

            if (!threadName) {
                  interaction.editReply("Unable to retrieve the submission summary.");
                  return;
            }

            const type = (embed.title ? embed.title.split(" ")[0].toLowerCase() + "s" : "suggestions") as "bugs" | "suggestions";

            const guildConfig = await Guilds.findOne(
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

            const submission = guildConfig?.[type].find(report => report.messageId === interaction.message.id);

            interaction.message.startThread({
                  name: threadName,
                  autoArchiveDuration: 10080, // 1 week
                  reason: "Submission discussion thread"
            }).then(async (thread) => {
                  interaction.editReply(`Started a discussion thread for **${type.slice(0, -1)}** \`${embed.footer?.text}\`.`);

                  if (guildConfig?.auto.dm.status) {
                        const author = await interaction.guild?.members.fetch(submission.author);
                        if (!author) return;

                        const dmEmbed = new EmbedBuilder()
                              .setColor(Properties.colors.default)
                              .setTitle(`Discussion thread for ${type.slice(0, -1)} ${embed.footer?.text}`)
                              .setDescription(`A discussion thread has been created for your submission, by ${interaction.user} (\`${interaction.user.id}\`)`)
                              .setTimestamp();

                        const jumpUrl = new ButtonBuilder()
                              .setURL(interaction.message.url)
                              .setLabel("Jump to Submission")
                              .setStyle(ButtonStyle.Link);

                        const openThread = new ButtonBuilder()
                              .setURL(thread.url)
                              .setLabel("Open Thread")
                              .setStyle(ButtonStyle.Link);

                        const actionRow = new ActionRowBuilder().setComponents(jumpUrl, openThread);

                        author.send({ 
                              embeds: [dmEmbed],
                              components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
                        }).catch(() => console.log("Unable to message submission author."));
                  }
            });

            return;
      } 
}