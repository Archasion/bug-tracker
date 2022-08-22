import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import { 
	ApplicationCommandOptionType, 
	ChatInputCommandInteraction, 
	ApplicationCommandType, 
	EmbedBuilder,
	ApplicationCommandNumericOptionData,
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";
import { SubmissionType } from "../../data/Types";

const idOption: ApplicationCommandNumericOptionData[] = [
	{
		name: "id",
		description: "The ID of the bug report.",
		type: ApplicationCommandOptionType.Number,
		required: true
	}
];

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
					options: idOption
				},
				{
					name: "player_report",
					description: "View a submitted player report.",
					type: ApplicationCommandOptionType.Subcommand,
					options: idOption
				},
				{
					name: "suggestion",
					description: "View a submitted suggestion.",
					type: ApplicationCommandOptionType.Subcommand,
					options: idOption
				}
			]
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		let type = interaction.options.getSubcommand();
		const id = interaction.options.getNumber("id") as number;

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

		const guildConfig = await Guild.findOne(
                  { id: interaction.guildId },
                  { [type]: 1, _id: 0 }
            );

		const submission = guildConfig?.[type as SubmissionType].find(item => item.number === id);

		if (!submission) {
			interaction.editReply(`There are no **${type}** with the ID of \`${id}\``);
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(Properties.colors.default)
			.setThumbnail(interaction.guild?.iconURL() as string | null)
			.setFooter({ text: `#${id}` });

		switch (type) {
			case "bugs": {
				embed.setAuthor({ name: `Priority: ${submission.priority}` });
				embed.setFields([
					{
						name: "Summary",
						value: submission.summary
					},
					{
						name: "Description",
						value: submission.description
					}
				]);

				if (submission.reproduction)
					embed.data.fields?.push({
						name: "Reproduction Steps",
						value: submission.reproduction
					});

				if (submission.specs)
					embed.data.fields?.push({
						name: "System Specs",
						value: submission.specs
					});

				break;
			}

			case "reports": {
				embed.setFields([
					{
						name: "Reported Player",
						value: submission.player
					},
					{
						name: "Reason",
						value: submission.reason
					}
				]);
				break;
			}

			case "suggestions": {
				embed.setTitle("Suggestion");
				embed.setDescription(submission.suggestion);
				break;
			}
		}

		interaction.editReply({
			content: `<@${submission.author}> (\`${submission.author}\`)`,
			embeds: [embed]
		});
	}
}