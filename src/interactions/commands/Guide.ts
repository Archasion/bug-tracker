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
                                          value: "bugreports"
                                    },
                                    {
                                          name: "How to Report Players",
                                          value: "playerreports"
                                    },
                                    {
                                          name: "How to Submit Suggestions",
                                          value: "suggestions"
                                    }
                              ]
				},
                        {
                              name: "public",
                              description: "Send the guide publicly? (Reviewer+)",
                              type: ApplicationCommandOptionType.Boolean
                        }
			]
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const sendPublicly = interaction.options.getBoolean("public");
            const topic = interaction.options.getString("topic");

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { title, description, example, attachmentName, attachmentFile } = Guides[topic];

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

                  interaction.editReply("Sent the guide!");
                  return;
            }

            interaction.editReply({ 
                  embeds: [embed],
                  files: attachmentFile
            });

            return;
	}
}