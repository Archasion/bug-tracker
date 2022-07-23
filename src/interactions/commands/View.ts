import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class ViewCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "view",
			description: "View a submitted report/suggestion.",
			restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: "bug_report",
					description: "View a submitted bug report.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "id",
							description: "The ID of the bug report.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: "player_report",
					description: "View a submitted player report.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "id",
							description: "The ID of the player report.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				},
				{
					name: "suggestion",
					description: "View a submitted suggestion.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "id",
							description: "The ID of the suggestion.",
							type: ApplicationCommandOptionType.String,
							required: true
						}
					]
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		let type = interaction.options.getSubcommand();
		const id = interaction.options.getString("id");

		switch (type) {
			case "bug_report":
				type = "bugs";
				break;
			case "player_report":
				type = "reports";
				break;
			case "suggestion":
				type = "suggestions";
				break;
		}

		const reports = await Guilds.findOne(
                  { id: interaction.guildId },
                  { [type]: 1, _id: 0 }
            );

		let report;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
		for (const item of reports[type]) {
			if (item.number == id) report = item;
		}

		if (!report) {
			interaction.editReply(`There are no **${type}** with the ID of \`${id}\``);
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(Properties.colors.default as ColorResolvable)
			.setFooter({ text: `#${id}` });

		switch (type) {
			case "bugs": {
				embed.setAuthor({ name: `Priority: ${report.priority}` });
				embed.setFields([
					{
						name: "Summary",
						value: report.summary
					},
					{
						name: "Description",
						value: report.description
					}
				]);

				if (report.specs)
					embed.data.fields?.push({
						name: "System Specs",
						value: report.specs
					});

				break;
			}

			case "reports": {
				embed.setFields([
					{
						name: "Reported Player",
						value: report.player
					},
					{
						name: "Reason",
						value: report.reason
					}
				]);
				break;
			}

			case "suggestions": {
				embed.setFields([
					{
						name: "Suggestion",
						value: report.suggestion
					}
				]);
				break;
			}
		}

		interaction.editReply({
			content: `<@${report.author}> (\`${report.author}\`)`,
			embeds: [embed]
		});
	}
}