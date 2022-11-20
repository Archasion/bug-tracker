import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class ServerCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "server",
            description: "Displays information about the server and configuration.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "info",
                    description: "Displays information about the server.",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "config",
                    description: "Displays the server's configuration (in regards to the bot).",
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const type = interaction.options.getSubcommand();

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setAuthor({
                name: interaction.guild?.name as string,
                iconURL: interaction.guild?.iconURL() as string
            })
            .setFooter({text: `Server ID: ${interaction.guild?.id}`})
            .setTimestamp();

        const guild = await Guild.findOne({_id: interaction.guildId});

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const {channels, roles, settings, submissions} = guild;
        const {bugReports, playerReports, suggestions} = submissions;

        const submissionCount = (
            Object.keys(bugReports).length +
            Object.keys(playerReports).length +
            Object.keys(suggestions).length
        ).toString();

        if (type === "config") {
            embed.setTitle("Server Configuration");
            embed.setDescription("All of the information below is stored in the bot's database.");
            embed.setFields([
                {
                    name: "Submission Count",
                    value: submissionCount,
                    inline: true
                },
                {
                    name: "Bug Reports Channel",
                    value: `${channels.bugReports ? `<#${channels.bugReports}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Player Reports Channel",
                    value: `${channels.playerReports ? `<#${channels.playerReports}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Suggestions Channel",
                    value: `${channels.suggestions ? `<#${channels.suggestions}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Bug Report Archive",
                    value: `${channels.archive.bugReports ? `<#${channels.archive.bugReports}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Player Report Archive",
                    value: `${channels.archive.playerReports ? `<#${channels.archive.playerReports}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Suggestion Archive",
                    value: `${channels.archive.suggestions ? `<#${channels.archive.suggestions}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Bot Updates Channel",
                    value: `${channels.botUpdates ? `<#${channels.botUpdates}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Create Threads (Bug Reports)",
                    value: `${settings.threads.bugReports ? "Enabled" : "Disabled"}`,
                    inline: true
                },
                {
                    name: "Create Threads (Suggestions)",
                    value: `${settings.threads.suggestions ? "Enabled" : "Disabled"}`,
                    inline: true
                },
                {
                    name: "Notify on Status Change",
                    value: `${settings.notifyOnStatusChange ? "Enabled" : "Disabled"}`,
                    inline: true
                },
                {
                    name: "Auto Roles",
                    value: `${settings.autoRoles?.length > 0 ? `<@&${settings.autoRoles.join("> <@&")}>` : "None"
                    }`,
                    inline: true
                },
                {
                    name: "Reviewer Role",
                    value: `${roles.reviewer ? `<@&${roles.reviewer}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Administrator Role",
                    value: `${roles.admin ? `<@&${roles.admin}>` : "None"}`,
                    inline: true
                },
                {
                    name: "Automatic Message Deletion",
                    value: `${settings.autoDelete.length > 0 ? `<#${settings.autoDelete.join("> <#")}>` : "None"}`,
                    inline: true
                }
            ]);
        } else {
            let guildRoles = interaction.guild?.roles.cache.map(role => role).join(" ") || "None";
            if (roles.length > 1024) guildRoles = "Too many roles to display...";

            embed.setTitle("Server Information");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            embed.setFields([
                {
                    name: "Created",
                    value: `<t:${Math.round(interaction.guild?.createdTimestamp as number / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "Members",
                    value: interaction.guild?.memberCount.toString(),
                    inline: true
                },
                {
                    name: "Submission Count",
                    value: submissionCount,
                    inline: true
                },
                {
                    name: "Bug Report Count",
                    value: Object.keys(bugReports).length.toString(),
                    inline: true
                },
                {
                    name: "Player Report Count",
                    value: Object.keys(playerReports).length.toString(),
                    inline: true
                },
                {
                    name: "Suggestion Count",
                    value: Object.keys(suggestions).length.toString(),
                    inline: true
                },
                {
                    name: "Emojis",
                    value: interaction.guild?.emojis.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Stickers",
                    value: interaction.guild?.stickers.cache.size.toString(),
                    inline: true
                },
                {
                    name: "Server Boosts",
                    value: interaction.guild?.premiumSubscriptionCount?.toString(),
                    inline: true
                },
                {
                    name: `Roles (${interaction.guild?.roles.cache.size})`,
                    value: guildRoles,
                    inline: true
                }
            ]);
        }

        await interaction.editReply({embeds: [embed]});
        return;
    }
}