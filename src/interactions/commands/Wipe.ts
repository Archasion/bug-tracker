import Command from "../../modules/interactions/commands/Command";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import { 
	ApplicationCommandOptionType, 
	ChatInputCommandInteraction, 
	ApplicationCommandType
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class WipeCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "wipe",
			description: "Wipe certain/all data from the database",
			restriction: RestrictionLevel.Owner,
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: "type",
					description: "The data you want to wipe",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{
							name: "Bug Reports",
							value: "bug"
						},
						{
							name: "Player Reports",
							value: "report"
						},
						{
							name: "Suggestions",
							value: "suggestion"
						},
						{
							name: "Channel Configuration",
							value: "channel"
						},
						{
							name: "Role Configuration",
							value: "role"
						},
						{
							name: "Automation",
							value: "auto"
						},
						{
							name: "Everything",
							value: "all"
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
            const type = interaction.options.getString("type");
            
            const isType = (typeInput: string) => type === typeInput || type === "all";

		if (isType("bug")) await Guild.updateOne({ id: interaction.guildId }, { $set: { bugs: [] } });
		if (isType("report")) await Guild.updateOne({ id: interaction.guildId }, { $set: { reports: [] } });
		if (isType("suggestion"))await Guild.updateOne({ id: interaction.guildId }, { $set: { suggestions: [] } });

		if (isType("channel")) {
			await Guild.updateOne(
				{ id: interaction.guildId },
				{
                              $set: {
                                    channels: {
                                          bugs: null,
                                          reports: null,
                                          suggestions: null,
                                          archive: null,
                                          bot_updates: null
                                    }
					}
				}
			);
		}

		if (isType("role")) {
			await Guild.updateOne(
				{ id: interaction.guildId },
				{
                              $set: {
                                    roles: {
                                          moderator: null,
                                          administrator: null
                                    }
					}
				}
			);
		}

		if (isType("auto")) {
			await Guild.updateOne(
				{ id: interaction.guildId },
				{
                              $set: {
                                    auto: {
                                          roles: [],
                                          delete: [],
							dm: {
								status: false
							},
                                          threads: {
                                                bugs: false,
                                                suggestions: false
                                          }
                                    }
					}
				}
			);
		}

		interaction.editReply(`Successfully wiped all${type !== "all" ? ` ${type}` : ""} data from the database!`);

            return;
	}
}