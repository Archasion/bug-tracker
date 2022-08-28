import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { 
	ChatInputCommandInteraction, 
	ApplicationCommandType,
      TextInputBuilder,
      ActionRowBuilder,
      ModalBuilder,
      TextInputStyle
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class AnnounceCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "announce",
			description: "Submit an announcement to guilds that have an updates channel set up.",
			restriction: RestrictionLevel.Developer,
			type: ApplicationCommandType.ChatInput,
                  modalResponse: true
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const announcement = new ModalBuilder()
                  .setCustomId("bot-announcement")
                  .setTitle("Bot Update Announcement")
                  .setComponents([
                        new ActionRowBuilder().addComponents(
                              new TextInputBuilder()
                                    .setCustomId("title")
                                    .setLabel("Title")
                                    .setMaxLength(256)
                                    .setPlaceholder("Title...")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue("")
                        ) as ActionRowBuilder<TextInputBuilder>,

                        new ActionRowBuilder().addComponents(
                              new TextInputBuilder()
                                    .setCustomId("description")
                                    .setLabel("Description")
                                    .setPlaceholder("Description...")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setValue("")
                        ) as ActionRowBuilder<TextInputBuilder>
                  ]);

            await interaction.showModal(announcement);
            return;
	}
}