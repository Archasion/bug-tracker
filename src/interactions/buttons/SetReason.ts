import Button from "../../modules/interactions/buttons/Button";

import {
    ButtonInteraction,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    Client
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class SetReasonButton extends Button {
    constructor(client: Client) {
        super(client, {
            name: {startsWith: "set-reason"},
            restriction: RestrictionLevel.Reviewer,
            defer: false
        });
    }

    /**
     * @param {ButtonInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ButtonInteraction): Promise<void> {
        const messageId = interaction.customId.split("-")[2];
        const submission = await interaction.channel?.messages.fetch(messageId);

        if (!submission) {
            await interaction.reply({
                content: "Unable to retrieve original message.",
                ephemeral: true
            });
            return;
        }

        const embed = submission.embeds[0]?.toJSON();

        if (!embed.author?.name.includes("Status")) {
            await interaction.reply({
                content: "This submission does not have a status.",
                ephemeral: true
            });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId(`set-reason-${messageId}`)
            .setTitle("Status Reason")
            .setComponents(
                new ActionRowBuilder().setComponents(
                    new TextInputBuilder()
                        .setCustomId("reason")
                        .setLabel("Reason")
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(1024)
                        .setRequired(true)
                        .setPlaceholder("The status reason...")
                ) as ActionRowBuilder<TextInputBuilder>
            );

        await interaction.showModal(modal).then(() => interaction.deleteReply());
        return;
    }
}