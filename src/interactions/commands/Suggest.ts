import Command from "../../modules/interactions/commands/Command";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
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
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const submissionChannel = await Guild.findOne({ id: interaction.guildId }, { ["channels.suggestions"]: 1, _id: 0 });

            if (!submissionChannel) {
                  await interaction.reply(ErrorMessages.ChannelNotConfigured);
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
                  .setCustomId("suggest")
                  .setTitle("Submit Suggestion")
                  .addComponents(actionRow);

            await interaction.showModal(modal);
            return;
	}
}