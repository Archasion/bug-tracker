import Modal from "../../modules/interactions/modals/Modal";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {ModalSubmitInteraction, TextChannel, NewsChannel, EmbedBuilder} from "discord.js";
import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {ContactEnquiry} from "../../data/Types";

export default class ContactModal extends Modal {
    constructor(client: Bot) {
        super(client, {
            name: {startsWith: "contact"},
            restriction: RestrictionLevel.Public
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const description = interaction.fields.getTextInputValue("description");
        const enquiry = interaction.customId.split("-")[1] as ContactEnquiry;
        const channelId = Properties.channels.bot[enquiry];

        const channel = this.client.channels.cache.get(channelId) as TextChannel | NewsChannel;

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setAuthor({name: `Submitted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()})
            .setTitle("Other")
            .setDescription(description)
            .setFooter({text: `ID: ${interaction.user.id}`})
            .setTimestamp();

        switch (enquiry) {
            case "support": {
                embed.setTitle("Support Request");
                break;
            }

            case "suggestions": {
                embed.setTitle("Suggestion");
                break;
            }

            case "bugs": {
                const reproductionSteps = interaction.fields.getTextInputValue("reproduction-steps");

                embed.setTitle("Bug Report");

                if (reproductionSteps) {
                    embed.setFields([{
                        name: "Reproduction Steps",
                        value: reproductionSteps
                    }]);
                }

                break;
            }

            case "feedback": {
                embed.setTitle("Bug Report");
                break;
            }
        }

        channel.send({
            content: `<@${Properties.users.developers[0]}>`,
            embeds: [embed]
        }).then(async () => {
            await interaction.editReply("Your enquiry has been sent.");
        });

        return;
    }
}