import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { 
      ApplicationCommandOptionType, 
      ChatInputCommandInteraction, 
      ApplicationCommandType,
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class ReportCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "report",
			description: "Submit a bug and/or player report for the server staff to review.",
			restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
			options: [
                        {
                              name: "player",
					description: "Submit a player report for the server staff to review.",
					type: ApplicationCommandOptionType.Subcommand,
                        },
                        {
                              name: "bug",
					description: "Submit a bug report for the server staff to review.",
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
            await interaction.editReply("This command has been deprecated, please use `/submit` instead.");
            return;
	}
}