import Modal from "../../modules/interactions/modals/Modal";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import { ModalSubmitInteraction, TextChannel, EmbedBuilder } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

type ContactType = "support" | "suggestions" | "bugs" | "feedback" | "other";

export default class ContactModal extends Modal {
      constructor(client: Bot) {
            super(client, {
                  name: { startsWith: "contact" },
                  restriction: RestrictionLevel.Public
            });
      }
      /**
       * @param  {ModalSubmitInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ModalSubmitInteraction): Promise<void> {
            const description = interaction.fields.getTextInputValue("description");
            const enquiry = interaction.customId.split("-")[1] as ContactType;
            const channelId = Properties.channels.bot[enquiry];

            const channel = this.client.channels.cache.get(channelId) as TextChannel;
            
            const embed = new EmbedBuilder()
                  .setColor(Properties.colors.default)
                  .setAuthor({ name: `Submitted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                  .setTitle("Other")
                  .setDescription(description)
                  .setFooter({ text: `ID: ${interaction.user.id}` })
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
            }).then(() => {
                  interaction.reply({
                        content: "Your enquiry has been sent.",
                        ephemeral: true
                  });
            });
            
            return;
      }
}