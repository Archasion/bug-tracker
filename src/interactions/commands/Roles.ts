import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ApplicationCommandStringOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    GuildMember,
    Role
} from "discord.js";

import RestrictionUtils, {RestrictionLevel} from "../../utils/RestrictionUtils";

const rankTypeSelection: ApplicationCommandStringOptionData = {
    name: "type",
    description: "The rank to configure.",
    type: ApplicationCommandOptionType.String,
    required: true,
    choices: [
        {
            name: "Reviewer",
            value: "reviewer"
        },
        {
            name: "Administrator",
            value: "admin"
        }
    ]
};

export default class RolesCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "roles",
            description: "Configure roles for the bot's usage.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "set",
                    description: "Assign a role to a specified rank.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        rankTypeSelection,
                        {
                            name: "role",
                            description: "The role to assign to the rank.",
                            type: ApplicationCommandOptionType.Role,
                            required: true
                        }
                    ]
                },
                {
                    name: "view",
                    description: "View configured roles.",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "reset",
                    description: "Remove a role configuration.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [rankTypeSelection]
                },
                {
                    name: "info",
                    description: "View role information.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "role",
                            description: "The role to display information for.",
                            type: ApplicationCommandOptionType.Role,
                            required: true
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
        const action = interaction.options.getSubcommand();
        const rankType = interaction.options.getString("type") as string;
        const role = interaction.options.getRole("role") as Role;

        // Require user to be admin to set/reset role configuration
        if (
            action.includes("set") &&
            !await RestrictionUtils.isAdministrator(interaction.member as GuildMember)
        ) {
            await interaction.editReply("You must be an **Administrator+** to use this subcommand.");
            return;
        }

        switch (action) {
            case "set": {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`roles.${rankType}`]: role?.id}}
                );

                await interaction.editReply(`The **${rankType}** role has been set to ${role}.`);
                break;
            }

            case "reset": {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`roles.${rankType}`]: null}}
                );

                await interaction.editReply(`The **${rankType}** role has been reset.`);
                break;
            }

            case "view": {
                const guild = await Guild.findOne(
                    {_id: interaction.guildId},
                    {roles: 1, _id: 0}
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const {reviewer, admin} = guild.roles;

                const embed = new EmbedBuilder()
                    .setColor(Properties.colors.default)
                    .setTitle("Role Configuration")
                    .setFields([
                        {
                            name: "Reviewer",
                            value: reviewer ? `<@&${reviewer}>` : "`None`",
                            inline: true
                        },
                        {
                            name: "Administrator",
                            value: admin ? `<@&${admin}>` : "`None`",
                            inline: true
                        }
                    ]);

                await interaction.editReply({embeds: [embed]});
                break;
            }

            case "info": {
                const numberOfPermissions = role.permissions.toArray().length;
                const embed = new EmbedBuilder()
                    .setColor(role.color)
                    .setTitle(role.name)
                    .setThumbnail(role.iconURL())
                    .setFooter({text: `Role ID: ${role.id}`})
                    .setFields([
                        {
                            name: "Created",
                            value: `<t:${Math.round(role.createdTimestamp / 1000)}:R>`,
                            inline: true
                        },
                        {
                            name: "HEX Color",
                            value: `\`${role.hexColor}\``,
                            inline: true
                        },
                        {
                            name: "Members",
                            value: role.members.size.toString(),
                            inline: true
                        },
                        {
                            name: "Position",
                            value: role.position.toString(),
                            inline: true
                        },
                        {
                            name: "Mentionable",
                            value: role.mentionable ? "Yes" : "No",
                            inline: true
                        },
                        {
                            name: "Hoisted",
                            value: role.hoist ? "Yes" : "No",
                            inline: true
                        },
                        {
                            name: `Permissions (${numberOfPermissions})`,
                            value: `\`${role.permissions.toArray().join("` `") || "None"}\``,
                            inline: false
                        }
                    ]);

                await interaction.editReply({embeds: [embed]});
                break;
            }
        }

        return;
    }
}