import Command from "../../modules/interactions/commands/Command";
import PermissionUtils, {ReplyType} from "../../utils/PermissionUtils";
import Properties from "../../data/Properties";
import Guild from "../../database/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandStringOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    PermissionFlagsBits,
    EmbedBuilder,
    TextChannel,
    NewsChannel,
    Channel,
    Role
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import ValidationUtils from "../../utils/ValidationUtils";

const actionOptions: ApplicationCommandStringOptionData = {
    name: "action",
    description: "The action to perform.",
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: [
        {
            name: "Add",
            value: "add"
        },
        {
            name: "Remove",
            value: "remove"
        },
        {
            name: "View",
            value: "view"
        }
    ]
};

export default class SettingsCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "settings",
            description: "Update server configuration.",
            restriction: RestrictionLevel.Administrator,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "auto_thread_creation",
                    description: "Create discussion threads for submissions automatically.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "The submission types to automate threads for.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Bug Reports",
                                    value: "bugReports"
                                },
                                {
                                    name: "Suggestions",
                                    value: "suggestions"
                                }
                            ]
                        },
                        {
                            name: "enabled",
                            description: "Whether or not the selected discussion thread automation is enabled.",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true
                        }
                    ]
                },
                {
                    name: "notify_on_status_change",
                    description: "Send a DM confirmation to users when their submission's status changes.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "enabled",
                            description: "Whether or not DM confirmations are enabled.",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true
                        }
                    ]
                },
                {
                    name: "allow_submission_attachments",
                    description: "Allow users to attach media to their submissions (Reviewer+ by default).",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "enabled",
                            description: "Whether or not submission attachments are allowed.",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true
                        }
                    ]
                },
                {
                    name: "auto_roles",
                    description: "Manage roles given to new members.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        actionOptions,
                        {
                            name: "role",
                            description: "The role to grant.",
                            type: ApplicationCommandOptionType.Role,
                            required: false
                        }
                    ]
                },
                {
                    name: "auto_message_deletion",
                    description: "Remove messages in a channel as they are being sent (Administrators+ are not affected).",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        actionOptions,
                        {
                            name: "channel",
                            description: "The channel to remove messages from.",
                            type: ApplicationCommandOptionType.Channel,
                            required: false
                        }
                    ]
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let selection = interaction.options.getSubcommand();

        switch (selection) {
            case "notify_on_status_change":
                selection = "notifyOnStatusChange";
                break;

            case "join_roles":
                selection = "joinRoles";
                break;

            case "auto_message_deletion":
                selection = "autoDelete";
                break;

            case "allow_submission_attachments":
                selection = "allowSubmissionAttachments";
                break;

            case "auto_thread_creation":
                selection = "threads";
                break;
        }

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {[`settings.${selection}`]: 1, _id: 0}
        );

        if (selection === "threads" || selection === "notifyOnStatusChange" || selection === "allowSubmissionAttachments") {
            const enabled = interaction.options.getBoolean("enabled");
            const type = interaction.options.getString("type") as string;

            if (
                (type && guild?.settings.threads[type] === enabled) ||
                (!type && guild?.settings[selection] === enabled)
            ) {
                await interaction.editReply(`This configuration has **already been ${enabled ? "enabled" : "disabled"}**.`);
                return;
            }

            await Guild.updateOne(
                {_id: interaction.guildId},
                {$set: {[`settings.${selection}${type ? `.${type}` : ""}`]: enabled}}
            );

            await interaction.editReply(`This configuration has been **${enabled ? "enabled" : "disabled"}** successfully.`);
            return;
        }

        // Grant role on join
        if (selection === "autoRoles") {
            const action = interaction.options.getString("action");
            const autoRoles = guild?.settings.autoRoles;

            if (action === "view") {
                if (autoRoles.length === 0) {
                    await interaction.editReply("No roles are configured to be added on join.");
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Auto Roles")
                    .setFields([{
                        name: "Roles",
                        value: `<@&${autoRoles.join(">\n<@&")}>`
                    }]);

                await interaction.editReply({embeds: [embed]});
                return;
            }

            const role = interaction.options.getRole("role") as Role;

            if (!role) {
                await interaction.editReply("Please specify a role to perform the action on.");
                return;
            }


            if (action === "add") {
                if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    await interaction.editReply("I need the `ManageRoles` permission for this task.");
                    return;
                }

                if (role.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
                    await interaction.editReply("I cannot add a role that is above than/is my highest role.");
                    return;
                }

                if (autoRoles.includes(role.id)) {
                    await interaction.editReply(`${role} is already being given on join.`);
                    return;
                }

                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$push: {["settings.autoRoles"]: role.id}}
                );

                await interaction.editReply(`${role} will now be given on join.`);
                return;
            }

            if (action === "remove") {
                if (!autoRoles.includes(role.id)) {
                    await interaction.editReply(`${role} is not configured to be given on join.`);
                    return;
                }

                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$pull: {["settings.autoRoles"]: role.id}}
                );

                await interaction.editReply(`${role} will no longer be given on join.`);
                return;
            }

        }

        // Automatically delete all messages in channel(s) - Unless sent by an Administrator+
        if (selection === "autoDelete") {
            const action = interaction.options.getString("action");
            const autoDelete = guild?.settings.autoDelete;

            if (action === "view") {
                if (autoDelete.length === 0) {
                    await interaction.editReply("No channels are configured for automatic message deletion.");
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Automatic Message Deletion")
                    .setFields([{
                        name: "Channels",
                        value: `<#${autoDelete.join(">\n<#")}>`
                    }]);

                await interaction.editReply({embeds: [embed]});
                return;
            }

            const channel = interaction.options.getChannel("channel") as Channel;

            if (!channel) {
                await interaction.editReply("Please specify a channel to perform the action on.");
                return;
            }

            if (!ValidationUtils.isTextOrNewsChannel(channel.type)) {
                await interaction.editReply("You must specify either a text or announcement channel.");
                return;
            }

            if (action === "add") {
                if (autoDelete.includes(channel.id)) {
                    await interaction.editReply(`Automatic message deletion for ${channel} is **already enabled**.`);
                    return;
                }

                if (!await PermissionUtils.verifyAccess({
                    interaction,
                    permissions: [
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ViewChannel
                    ],
                    channel: channel as TextChannel | NewsChannel,
                    replyType: ReplyType.EditReply
                })) return;

                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$push: {["settings.autoDelete"]: channel.id}}
                );

                await interaction.editReply(`Automatic message deletion for ${channel} has been **enabled**.`);
                return;
            }

            if (action === "remove") {
                if (!autoDelete.includes(channel.id)) {
                    await interaction.editReply(`Automatic message deletion for ${channel} is **already disabled**.`);
                    return;
                }

                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$pull: {["settings.autoDelete"]: channel.id}}
                );

                await interaction.editReply(`Automatic message deletion for ${channel} has been **disabled**.`);
                return;
            }

        }
    }
}