import Command from "../../modules/interactions/commands/Command";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    ModalBuilder,
    Client
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class AnnounceCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "announce",
            description: "Send announcement to all configured guilds.",
            restriction: RestrictionLevel.Developer,
            type: ApplicationCommandType.ChatInput,
            defer: false // Modal response
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