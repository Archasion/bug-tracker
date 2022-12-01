import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import Bot from "../../Bot";

import {
    SelectMenuInteraction,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class BugPrioritySelectMenu extends SelectMenu {
    constructor(client: Bot) {
        super(client, {
            name: "bug-priority",
            restriction: RestrictionLevel.Public,
            defer: false
        });
    }

    /**
     * @param {SelectMenuInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: SelectMenuInteraction): Promise<void> {
        const [priority] = interaction.values;

        const modal = new ModalBuilder()
            .setCustomId(`bug-report-${priority}`)
            .setTitle("Bug Report")
            .addComponents([
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("summary")
                        .setLabel("Summary of the bug")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setPlaceholder("Summary...")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>,

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("description")
                        .setLabel("Description of the bug")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setPlaceholder("Description...")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>,

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("reproduction")
                        .setLabel("Reproduction steps")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setPlaceholder("- Step 1: ...\n- Step 2: ...\n- Step 3: ...")
                        .setRequired(false)
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>,

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("specs")
                        .setLabel("System Specs")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setPlaceholder("System Specs...")
                        .setRequired(false)
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>
            ]);

        await interaction.showModal(modal).then(() => interaction.deleteReply());
        return;
    }
}