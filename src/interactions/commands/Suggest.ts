import Command from "../../modules/interactions/commands/Command";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { 
	ChatInputCommandInteraction, 
	ApplicationCommandType,
      ActionRowBuilder,
      TextInputBuilder,
      TextInputStyle,
      ModalBuilder
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class SuggestCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "suggest",
			description: "Submit a suggestion for the server staff to review.",
			restriction: RestrictionLevel.Public,
			type: ApplicationCommandType.ChatInput,
                  modalResponse: true
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const submissionChannel = await Guilds.findOne({ id: interaction.guildId }, { ["channels.suggestions"]: 1, _id: 0 });

            if (!submissionChannel) {
                  interaction.reply("There is no submission channel set for suggestion, an `Administrator` is able to set one using `/channel set Suggestion Submissions`");
                  return;
            }

            const suggestionInput = new TextInputBuilder()
                  .setCustomId("suggestion")
                  .setLabel("Suggestion")
                  .setPlaceholder("Enter your suggestion...")
                  .setMinLength(12)
                  .setMaxLength(1024)
                  .setRequired(true)
                  .setStyle(TextInputStyle.Paragraph)
                  .setValue("");

            const actionRow = new ActionRowBuilder().addComponents(suggestionInput) as ActionRowBuilder<TextInputBuilder>;

            const modal = new ModalBuilder()
                  .setCustomId("suggestion-form")
                  .setTitle("Submit Suggestion")
                  .addComponents(actionRow);

            interaction.showModal(modal);
            return;
	}
}