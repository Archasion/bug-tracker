import Command from "../../modules/interactions/commands/Command";
import PermissionUtils from "../../utils/PermissionUtils";
import Properties from "../../data/Properties";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandChoicesData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    PermissionFlagsBits,
    EmbedBuilder,
    ChannelType,
    TextChannel,
    NewsChannel,
    Role
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

const actionOption: ApplicationCommandChoicesData = {
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

export default class AutoCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "auto",
            description: "Configure automated tasks.",
            restriction: RestrictionLevel.Administrator,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "threads",
                    description: "Create discussion threads for reports/suggestions automatically.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "The submissions to automate threads for.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Bug Reports",
                                    value: "bugs"
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
                    name: "dm",
                    description: "Send a DM confirmation to users when their report/suggestion status changes.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "type",
                            description: "The type of DM confirmations.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Report/Suggestion Status Change",
                                    value: "status"
                                }
                            ]
                        },
                        {
                            name: "enabled",
                            description: "Whether or not DM confirmations are enabled.",
                            type: ApplicationCommandOptionType.Boolean,
                            required: true
                        }
                    ]
                },
                {
                    name: "roles",
                    description: "View a submitted suggestion.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        actionOption,
                        {
                            name: "role",
                            description: "The role to perform the action on.",
                            type: ApplicationCommandOptionType.Role,
                            required: false
                        }
                    ]
                },
                {
                    name: "delete",
                    description: "Remove messages in a channel as they are being sent.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        actionOption,
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
        const subCommand = interaction.options.getSubcommand();

        const guildConfig = await Guild.findOne(
            {id: interaction.guildId},
            {[`auto.${subCommand}`]: 1, _id: 0}
        );

        if (subCommand === "threads") {
            const enabled = interaction.options.getBoolean("enabled");
            const type = interaction.options.getString("type") as string;

            if (guildConfig?.auto.threads[type] === enabled) {
                await interaction.editReply(`Automatic discussion thread creation is **already ${enabled ? "enabled" : "disabled"}** for these submissions.`);
                return;
            }

            await Guild.updateOne(
                {id: interaction.guildId},
                {$set: {[`auto.threads.${type}`]: enabled}}
            );

            await interaction.editReply(`Automatic discussion thread creation has been **${enabled ? "enabled" : "disabled"}** for these submissions.`);
            return;
        }

        if (subCommand === "dm") {
            const enabled = interaction.options.getBoolean("enabled");
            const type = interaction.options.getString("type") as string;

            if (guildConfig?.auto.dm[type] === enabled) {
                await interaction.editReply(`These DM confirmations are **already ${enabled ? "enabled" : "disabled"}**.`);
                return;
            }

            await Guild.updateOne(
                {id: interaction.guildId},
                {$set: {[`auto.dm.${type}`]: enabled}}
            );

            await interaction.editReply(`DM confirmations for this task have been **${enabled ? "enabled" : "disabled"}**.`);
            return;
        }

        if (subCommand === "roles") {
            const action = interaction.options.getString("action");

            if (action === "view") {
                if (guildConfig?.auto.roles.length === 0) {
                    await interaction.editReply("No roles are configured to be added on join.");
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Role Automation")
                    .setFields([
                        {
                            name: "Roles",
                            value: `<@&${guildConfig?.auto.roles.join("> <@&")}>`
                        }
                    ]);

                await interaction.editReply({embeds: [embed]});
                return;
            }

            const role = interaction.options.getRole("role") as Role;

            if (!role) {
                await interaction.editReply("Please specify a channel to perform the action on.");
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

                if (guildConfig?.auto.roles.includes(role.id)) {
                    await interaction.editReply(`${role} is already being given on join.`);
                    return;
                }

                await Guild.updateOne(
                    {id: interaction.guildId},
                    {$push: {["auto.roles"]: role.id}}
                );

                await interaction.editReply(`${role} will now be given on join.`);
                return;
            }

            if (action === "remove") {
                if (!guildConfig?.auto.roles.includes(role.id)) {
                    await interaction.editReply(`${role} is already not being given on join.`);
                    return;
                }

                await Guild.updateOne(
                    {id: interaction.guildId},
                    {$pull: {["auto.roles"]: role.id}}
                );

                await interaction.editReply(`${role} will no longer be given on join.`);
                return;
            }

        }

        if (subCommand === "delete") {
            const action = interaction.options.getString("action");

            if (action === "view") {
                if (guildConfig?.auto.delete.length === 0) {
                    await interaction.editReply("No channels are configured for automatic message deletion.");
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Automatic Message Deletion")
                    .setFields([
                        {
                            name: "Channels",
                            value: `<#${guildConfig?.auto.delete.join("> <#")}>`
                        }
                    ]);

                await interaction.editReply({embeds: [embed]});
                return;
            }

            const channel = interaction.options.getChannel("channel") as TextChannel | NewsChannel;

            if (!channel) {
                await interaction.editReply("Please specify a channel to perform the action on.");
                return;
            }

            if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildNews) {
                await interaction.editReply("You must specify either a text or announcement channel.");
                return;
            }

            if (action === "add") {
                if (guildConfig?.auto.delete.includes(channel.id)) {
                    await interaction.editReply(`Automatic message deletion for ${channel} is **already enabled**.`);
                    return;
                }

                if (!await PermissionUtils.botHasPermissions({
                    interaction,
                    permissions: [
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ViewChannel
                    ],
                    channel,
                    replyType: "EditReply"
                })) return;

                await Guild.updateOne(
                    {id: interaction.guildId},
                    {$push: {["auto.delete"]: channel.id}}
                );

                await interaction.editReply(`Automatic message deletion for ${channel} has been **enabled**.`);
                return;
            }

            if (action === "remove") {
                if (!guildConfig?.auto.delete.includes(channel.id)) {
                    await interaction.editReply(`Automatic message deletion for ${channel} is **already disabled**.`);
                    return;
                }

                await Guild.updateOne(
                    {id: interaction.guildId},
                    {$pull: {["auto.delete"]: channel.id}}
                );

                await interaction.editReply(`Automatic message deletion for ${channel} has been **disabled**.`);
                return;
            }

        }
    }
}