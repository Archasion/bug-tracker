import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guides from "../../data/Guides";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    PermissionFlagsBits,
    EmbedBuilder,
    GuildMember,
    TextChannel,
    NewsChannel,
    Client
} from "discord.js";

import RestrictionUtils, {RestrictionLevel} from "../../utils/RestrictionUtils";
import PermissionUtils, {ReplyType} from "../../utils/PermissionUtils";
import {Guide} from "../../data/Types";

export default class GuideCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "guide",
            description: "View guides on certain usages of the bot.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
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
        const topic = interaction.options.getString("topic") as Guide;

        const {title, description, example, attachmentName, attachmentFiles} = Guides[topic];

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle(title)
            .setDescription(description)
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        if (attachmentName && attachmentFiles.length > 0) embed.setImage(`attachment://${attachmentName}`);
        if (example) embed.setFields([{name: "Example", value: `\`/${example}\``}]);

        if (
            await RestrictionUtils.isReviewer(interaction.member as GuildMember) &&
            await PermissionUtils.verifyAccess({
                interaction,
                permissions: [PermissionFlagsBits.SendMessages],
                channel: interaction.channel as TextChannel | NewsChannel,
                replyType: ReplyType.EditReply
            }) &&
            sendPublicly
        ) {
            interaction.channel?.send({
                embeds: [embed],
                files: attachmentFiles
            });

            await interaction.editReply("Sent the guide!");
            return;
        }

        await interaction.editReply({
            embeds: [embed],
            files: attachmentFiles
        });

        return;
    }
}