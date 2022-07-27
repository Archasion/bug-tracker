import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { 
	ChatInputCommandInteraction, 
	ApplicationCommandType,
      ModalBuilder,
      ActionRowBuilder,
      TextInputStyle,
      TextInputBuilder
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