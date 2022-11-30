import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Properties from "../../data/Properties";
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
            description: "View the server's info and configuration.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "info",
                    description: "Display information about the server.",
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
        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {_id: 0, submissions: 1}
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const {bugReports, playerReports, suggestions} = guild.submissions;

        const submissionCount = (
            Object.keys(bugReports).length +
            Object.keys(playerReports).length +
            Object.keys(suggestions).length
        ).toString();

        let guildRoles = interaction.guild?.roles.cache.map(role => role).join(" ") || "None";
        if (guildRoles.length > 1024) guildRoles = "Too many roles to display...";

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Server Information")
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .setImage(interaction.guild?.bannerURL())
            .setFooter({text: `Server ID: ${interaction.guild?.id}`})
            .setAuthor({
                name: interaction.guild?.name as string,
                iconURL: interaction.guild?.iconURL() as string
            })
            .setFields([
                {
                    name: "Created",
                    value: `<t:${Math.round(interaction.guild?.createdTimestamp as number / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "Members",
                    value: interaction.guild?.memberCount.toString() || "Error",
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
                    value: interaction.guild?.emojis.cache.size.toString() || "Error",
                    inline: true
                },
                {
                    name: "Stickers",
                    value: interaction.guild?.stickers.cache.size.toString() || "Error",
                    inline: true
                },
                {
                    name: "Server Boosts",
                    value: interaction.guild?.premiumSubscriptionCount?.toString() || "Error",
                    inline: true
                },
                {
                    name: `Roles (${interaction.guild?.roles.cache.size})`,
                    value: guildRoles,
                    inline: true
                }
            ]);

        await interaction.editReply({embeds: [embed]});
        return;
    }
}