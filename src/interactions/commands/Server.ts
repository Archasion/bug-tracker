import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class EvalCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "server",
			description: "Displays information about the server and configuration.",
			restriction: RestrictionLevel.Public,
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
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const type = interaction.options.getSubcommand();

		const embed = new EmbedBuilder()
			.setColor(Properties.colors.default)
			.setAuthor({ name: interaction.guild?.name as string, iconURL: interaction.guild?.iconURL() as string })
			.setFooter({ text: `Server ID: ${interaction.guild?.id}` })
			.setTimestamp();
		
		const guildConfig = await Guilds.findOne(
			{ id: interaction.guild?.id },
			{
				channels: 1,
				roles: 1,
				auto: 1,
				bugs: 1,
				reports: 1,
				suggestions: 1,
				_id: 0
			}
		) as any;

		const { channels, roles, auto, bugs, reports, suggestions } = guildConfig;

		if (type === "config") {
			embed.setTitle("Server Configuration");
			embed.setDescription("All of the information below is stored in the bot's database.");
			embed.setFields([
				{
					name: "Reports/Suggestions",
					value: (bugs.length + reports.length + suggestions.length).toString(),
					inline: true
				},
				{
					name: "Bug Reports Channel",
					value: `${channels.bugs ? `<#${channels.bugs}>` : "None"}`,
					inline: true
				},
				{
					name: "Player Reports Channel",
					value: `${channels.reports ? `<#${channels.reports}>` : "None"}`,
					inline: true
				},
				{
					name: "Suggestions Channel",
					value: `${channels.suggestions ? `<#${channels.suggestions}>` : "None"}`,
					inline: true
				},
				{
					name: "Archive Channel",
					value: `${channels.archive ? `<#${channels.archive}>` : "None"}`,
					inline: true
				},
				{
					name: "Bot Updates Channel",
					value: `${channels.bot_updates ? `<#${channels.bot_updates}>` : "None"}`,
					inline: true
				},
				{
					name: "Auto Threads (Bugs)",
					value: `${auto.threads.bugs ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "Auto Threads (Suggestions)",
					value: `${auto.threads.suggestions ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "DM on Status Change",
					value: `${auto.dm.status ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "Auto Role",
					value: `${auto.roles.length > 0 ? `<@&${auto.roles.join("> <@&")}>` : "None"
						}`,
					inline: true
				},
				// {
				// 	name: "Reviewer Role",
				// 	value: `${roles.moderator ? `<@&${roles.moderator}>` : "None"}`,
				// 	inline: true
				// },
				{
					name: "Moderator Role",
					value: `${roles.moderator ? `<@&${roles.moderator}>` : "None"}`,
					inline: true
				},
				{
					name: "Administrator Role",
					value: `${roles.administrator ? `<@&${roles.administrator}>` : "None"}`,
					inline: true
				},
				{
					name: "Automatic Message Deletion",
					value: `${auto.delete.length > 0 ? `<#${auto.delete.join("> <#")}>` : "None"}`,
					inline: false
				}
			]);
		} else {
			let guildRoles = interaction.guild?.roles.cache.map(role => role).join(" ") || "None";
			if (roles.length > 1024) guildRoles = "Too many roles to display...";
			
			embed.setTitle("Server Information");
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

			interaction.editReply({ embeds: [embed] });
			return;
		}
	}
};