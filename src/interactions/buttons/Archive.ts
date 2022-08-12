import Button from "../../modules/interactions/buttons/Button";
import PermissionUtils from "../../utils/PermissionUtils";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { ButtonInteraction, TextChannel, NewsChannel } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

type SubmissionType = "bugs" | "reports" | "suggestions";

export default class ArchiveButton extends Button {
      constructor(client: Bot) {
            super(client, {
                  name: "archive-report", // TODO Change to "archive"
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
	 * @param {ButtonInteraction} interaction
	 * @returns {Promise<void>}
	 */
      async execute(interaction: ButtonInteraction): Promise<void> {
            const embed = interaction.message.embeds[0].toJSON();
            
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

            const guildConfig = await Guilds.findOne(
                  { id: interaction.guildId },
                  {
                        ["channels.archive"]: 1,
                        [type]: 1,
                        _id: 0
                  }
            );

            const isValid = guildConfig?.[type].some(report => report.messageId === interaction.message.id);

            if (!isValid) {
                  interaction.editReply(`This ${type.slice(0, -1)} is not located in the database.`);
                  return;
            }

            const archiveChannelId = guildConfig?.channels.archive;

            if (!archiveChannelId) {
                  interaction.editReply("There is no archive channel set. A moderator is able to set one using `/channel set`");
                  return;
            }

            const archiveChannel = interaction.guild?.channels.cache.get(archiveChannelId) as TextChannel | NewsChannel;

            if (!await PermissionUtils.botHasPermissions(interaction, ["SendMessages", "ViewChannel"], archiveChannel)) return;
            if (!await PermissionUtils.botHasPermissions(interaction, ["ManageMessages", "ViewChannel"])) return;

            archiveChannel.send({
                  content: interaction.message.content,
                  embeds: [embed],
                  files: []
            }).then(() => {
                  interaction.message.delete();
                  interaction.editReply(`The ${type.slice(0, -1)} with the ID of \`${embed.footer?.text}\` has been archived.`);
            });

            return;
      } 
}