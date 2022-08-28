import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guides from "../../data/Guides";
import Bot from "../../Bot";

import { 
      ApplicationCommandOptionType, 
      ChatInputCommandInteraction, 
      ApplicationCommandType, 
      PermissionFlagsBits,
      EmbedBuilder, 
      GuildMember
} from "discord.js";

import { Guide } from "../../data/Types";

import RestrictionUtils, { RestrictionLevel } from "../../utils/RestrictionUtils";
import PermissionUtils from "../../utils/PermissionUtils";

export default class GuideCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "guide",
			description: "View guides on certain usages of the bot.",
			restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
			options: [
                        {
                              name: "topic",
					description: "The topic to view a guide on.",
					required: true,
					type: ApplicationCommandOptionType.String,
                              choices: [
                                    {
                                          name: "How to Report Bugs",
                                          value: "bug_reports"
                                    },
                                    {
                                          name: "How to Report Players",
                                          value: "player_reports"
                                    },
                                    {
                                          name: "How to Submit Suggestions",
                                          value: "suggestions"
                                    }
                              ]
				},
                        {
                              name: "public",
                              description: "Send the guide publicly? (Moderator+)",
                              type: ApplicationCommandOptionType.Boolean
                        }
			]
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const sendPublicly = interaction.options.getBoolean("public");
            const topic = interaction.options.getString("topic");

            const { title, description, example, attachmentName, attachmentFile } = Guides[topic as Guide];

            const embed = new EmbedBuilder()
                  .setColor(Properties.colors.default)
                  .setTitle(title)
                  .setDescription(description)
                  .setFooter({
                        text: `Requested by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                  })
                  .setTimestamp();

            if (attachmentName && attachmentFile.length > 0) embed.setImage(`attachment://${attachmentName}`);
            if (example) embed.setFields([{ name: "Example", value: `\`/${example}\`` }]);
            
            if (
                  await RestrictionUtils.isModerator(interaction.member as GuildMember) && 
                  await PermissionUtils.botHasPermissions(interaction, [PermissionFlagsBits.SendMessages]) &&
                  sendPublicly
            ) {
                  interaction.channel?.send({ 
                        embeds: [embed],
                        files: attachmentFile
                  });

                  await interaction.editReply("Sent the guide!");
                  return;
            }

            await interaction.editReply({ 
                  embeds: [embed],
                  files: attachmentFile
            });

            return;
	}
}