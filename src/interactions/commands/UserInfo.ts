import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Properties from "../../data/Properties";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    GuildMember,
    ButtonStyle,
    Client
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class UserInfoCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "user",
            description: "User command.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "info",
                    description: "View member information and their submission statistics.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "member",
                            description: "The member to view information about.",
                            type: ApplicationCommandOptionType.User,
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
        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {submissions: 1, _id: 0}
        );

        const member = interaction.options.getMember("member") as GuildMember;
        await member.user.fetch(true);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let {bugReports, playerReports, suggestions} = guild.submissions;

        suggestions = Object.keys(suggestions).filter(id => suggestions[id].authorId === member.id);
        playerReports = Object.keys(playerReports).filter(id => playerReports[id].authorId === member.id);
        bugReports = Object.keys(bugReports).filter(id => bugReports[id].authorId === member.id);

        const suggestionsLength = suggestions.length;
        const playerReportsLength = playerReports.length;
        const bugReportsLength = bugReports.length;

        const permissionsInGuild = member.permissions.toArray().join("` `") || "None";
        const memberRoles = member.roles.cache.map(role => role).join(" ") || "None";

        const info = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle(member.displayName)
            .setThumbnail(member.displayAvatarURL())
            .setImage(member.user.bannerURL() as string | null)
            .setFooter({text: `User ID: ${member.id}`})
            .setAuthor({
                name: member.user.tag,
                iconURL: member.user.displayAvatarURL()
            })
            .setFields([
                {
                    name: "Created",
                    value: `<t:${Math.round(member.user.createdTimestamp as number / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "Joined",
                    value: `<t:${Math.round(member.joinedTimestamp as number / 1000)}:R>`,
                    inline: true
                },
                {
                    name: "Submissions",
                    value: (bugReportsLength + playerReportsLength + suggestionsLength).toString(),
                    inline: true
                },
                {
                    name: "Bug Reports",
                    value: bugReportsLength.toString(),
                    inline: true
                },
                {
                    name: "Player Reports",
                    value: playerReportsLength.toString(),
                    inline: true
                },
                {
                    name: "Suggestions",
                    value: suggestionsLength.toString(),
                    inline: true
                },
                {
                    name: `Roles (${member.roles.cache.size})`,
                    value: memberRoles,
                    inline: false
                },
                {
                    name: `Permissions (${member.permissions.toArray().length})`,
                    value: `\`${permissionsInGuild}\``,
                    inline: false
                }
            ]);

        const avatarUrl = new ButtonBuilder({})
            .setLabel("Avatar")
            .setStyle(ButtonStyle.Link)
            .setURL(member.displayAvatarURL());

        const actionRow = new ActionRowBuilder().setComponents(avatarUrl) as ActionRowBuilder<ButtonBuilder>;

        await interaction.editReply({
            content: `${member}`,
            embeds: [info],
            components: [actionRow]
        });

        return;
    }
}