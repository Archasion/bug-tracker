import Command from "../../modules/interactions/commands/Command";
import ValidationUtils from "../../utils/ValidationUtils";
import Guild from "../../database/models/Guild.model";
import Properties from "../../data/Properties";

import {
    ApplicationCommandStringOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    PermissionFlagsBits,
    EmbedBuilder,
    NewsChannel,
    TextChannel,
    Channel,
    Client
} from "discord.js";

import PermissionUtils, {ReplyType, SubmissionChannelPermissions} from "../../utils/PermissionUtils";
import {RestrictionLevel} from "../../utils/RestrictionUtils";

const selectChannelType: ApplicationCommandStringOptionData = {
    name: "type",
    description: "The type of channel to perform the action on",
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: [
        {
            name: "Suggestion Submissions",
            value: "suggestions"
        },
        {
            name: "Bug Report Submissions",
            value: "bugReports"
        },
        {
            name: "Player Report Submissions",
            value: "playerReports"
        },
        {
            name: "Bug Report Archive",
            value: "archive.bugReports"
        },
        {
            name: "Player Report Archive",
            value: "archive.playerReports"
        },
        {
            name: "Suggestion Archive",
            value: "archive.suggestions"
        },
        {
            name: "Bot Update Announcements",
            value: "botUpdates"
        }
    ]
};

export default class ChannelsCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "channels",
            description: "Manage the channels configured for the bot.",
            restriction: RestrictionLevel.Administrator,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "set",
                    description: "Sets the channel for the bot perform certain tasks in.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        selectChannelType,
                        {
                            name: "channel",
                            description: "The channel to set for the chosen task(s).",
                            type: ApplicationCommandOptionType.Channel,
                            required: true
                        }
                    ]
                },
                {
                    name: "view",
                    description: "View configured channels.",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "reset",
                    description: "Remove a channel configuration (will prevent certain tasks from being performed)",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [selectChannelType]
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const action = interaction.options.getSubcommand();
        const type = interaction.options.getString("type") as string;

        switch (action) {
            case "set": {
                const channel = interaction.options.getChannel("channel") as Channel;

                if (!ValidationUtils.isTextOrNewsChannel(channel.type)) {
                    await interaction.editReply("You must select either a text or news channel.");
                    return;
                }

                let permissions = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages];

                switch (type) {
                    case "suggestions":
                        permissions = SubmissionChannelPermissions.Suggestions;
                        break;

                    case "bugReports":
                        permissions = SubmissionChannelPermissions.BugReports;
                        break;

                    case "playerReports":
                        permissions = SubmissionChannelPermissions.PlayerReports;
                        break;
                }

                if (!await PermissionUtils.verifyAccess({
                    interaction,
                    permissions,
                    channel: channel as TextChannel | NewsChannel,
                    replyType: ReplyType.EditReply
                })) return;

                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`channels.${type}`]: channel?.id}}
                );

                await interaction.editReply(`The channel has been set to ${channel}.`);
                break;
            }

            case "reset": {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`channels.${type}`]: null}}
                );

                await interaction.editReply("The channel has been reset.");
                break;
            }

            case "view": {
                const guild = await Guild.findOne(
                    {_id: interaction.guildId},
                    {channels: 1, _id: 0}
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const {archive, botUpdates, bugReports, playerReports, suggestions} = guild.channels;

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Channel Configuration")
                    .setFields([
                        {
                            name: "Bug Reports",
                            value: bugReports ? `<#${bugReports}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Player Reports",
                            value: playerReports ? `<#${playerReports}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Suggestions",
                            value: suggestions ? `<#${suggestions}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Bug Reports (Archive)",
                            value: archive?.bugReports ? `<#${archive?.bugReports}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Player Reports (Archive)",
                            value: archive?.playerReports ? `<#${archive?.playerReports}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Suggestions (Archive)",
                            value: archive?.suggestions ? `<#${archive?.suggestions}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Bot Updates",
                            value: botUpdates ? `<#${botUpdates}>` : "`None`",
                            inline: true
                        }
                    ]);

                await interaction.editReply({embeds: [embed]});
                break;
            }
        }

        return;
    }
}