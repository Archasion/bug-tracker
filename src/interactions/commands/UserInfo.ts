import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { 
      ApplicationCommandOptionType,
      ChatInputCommandInteraction, 
      ApplicationCommandType,
      ActionRowBuilder,
      ButtonBuilder,
      EmbedBuilder,
      GuildMember,
      ButtonStyle
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class UserInfoCommand extends Command {
      constructor(client: Bot) {
            super(client, {
                  name: "user-info",
                  description: "View information and report statistics about a member.",
                  restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
                  options: [
                        {
                              name: "member",
                              description: "The member to view information about.",
                              type: ApplicationCommandOptionType.User
                        }
                  ]
            });
      }

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void|any>}
	 */
      async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const guildConfig = await Guilds.findOne(
                  { id: interaction.guildId }, 
                  { 
                        bugs: 1, 
                        reports: 1, 
                        suggestions: 1, 
                        _id: 0 
                  }
            );

		const member = interaction.options.getMember("member") as GuildMember;
		await member.user.fetch(true);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { bugs, reports, suggestions } = guildConfig;


		const permissions = member.permissions.toArray().join("` `") || "None";
		const roles = member.roles.cache.map(role => role).join(" ") || "None";

		const info = new EmbedBuilder()
			.setColor(Properties.colors.default)
			.setTitle(member.displayName)
			.setThumbnail(member.displayAvatarURL())
			.setImage(member.user.bannerURL() as string | null)
			.setFooter({ text: `ID: ${member.id}` })
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
					name: "All Reports",
					value: (bugs.length + reports.length + suggestions.length).toString(),
					inline: true
				},
				{
					name: "Bug Reports",
					value: bugs.length.toString(),
					inline: true
				},
				{
					name: "Player Reports",
					value: reports.length.toString(),
					inline: true
				},
				{
					name: "Suggestions",
					value: suggestions.length.toString(),
					inline: true
				},
				{
                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
					name: `Roles (${member._roles.length})`,
					value: roles,
					inline: false
				},
				{
					name: `Permissions (${member.permissions.toArray().length})`,
					value: `\`${permissions}\``,
					inline: false
				}
			]);

		const actionRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder().addComponents(
                  new ButtonBuilder({})
			.setLabel("Avatar")
			.setStyle(ButtonStyle.Link)
			.setURL(member.displayAvatarURL())
            ) as ActionRowBuilder<ButtonBuilder>;

		interaction.editReply({
			content: `${member}`,
			embeds: [info],
			components: [actionRow]
		});

            return;
      }
}