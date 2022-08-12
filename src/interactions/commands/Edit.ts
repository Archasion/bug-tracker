import Command from "../../modules/interactions/commands/Command";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { 
	ApplicationCommandOptionType,
	ChatInputCommandInteraction, 
	ApplicationCommandType,
      ActionRowBuilder,
      TextInputBuilder,
      TextInputStyle,
      ModalBuilder,
      TextChannel,
      NewsChannel
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class EditCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "edit",
			description: "Edit a report or suggestion that you have submitted.",
			restriction: RestrictionLevel.Public,
			type: ApplicationCommandType.ChatInput,
                  modalResponse: true,
                  options: [
                        {
                              name: "type",
                              description: "The submission type to edit.",
                              type: ApplicationCommandOptionType.String,
                              required: true,
                              choices: [
                                    {
                                          name: "Bug Report",
                                          value: "bugs"
                                    },
                                    {
                                          name: "Player Report",
                                          value: "reports"
                                    },
                                    {
                                          name: "Suggestion",
                                          value: "suggestions"
                                    }
                              ]
                        },
                        {
                              name: "id",
                              description: "The number in the report/suggestion's footer.",
                              type: ApplicationCommandOptionType.Number,
                              required: true
                        }
                  ]
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const type = interaction.options.getString("type") as string;
            const id = interaction.options.getNumber("id") as number;

            const channelConfig = await Guilds.findOne(
                  { id: interaction.guildId }, 
                  { [`channels.${type}`]: 1, _id: 0 }
            );

            if (!channelConfig?.channels[type]) {
                  interaction.reply({ 
                        content: "There is no channel set for these submissions, an `Administrator` can set one using `/channel set`",
                        ephemeral: true
                  });

                  return;
            }

            const reportConfig = await Guilds.findOne(
                  { id: interaction.guildId },
                  { [type]: 1, _id: 0 }
            );

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const report = reportConfig?.[type].find(item => item.number === id);

            if (!report) {
                  interaction.reply({ 
                        content: `Unable to find report \`#${id}\``,
                        ephemeral: true
                  });

                  return;
            }

            const { messageId, author } = report;

            if (author !== interaction.user.id) {
                  interaction.reply({ 
                        content: "You must be the author of the report in order to edit its content.",
                        ephemeral: true
                  });

                  return;
            }

            const submissionChannel = interaction.guild?.channels.cache.get(channelConfig?.channels[type]) as TextChannel | NewsChannel;

            if (!submissionChannel) {
                  interaction.reply({ 
                        content: "The submission channel has either been removed or I no longer have access to it.", 
                        ephemeral: true 
                  });

                  return;
            }

            let reportMessage;
            try {
                  reportMessage = await submissionChannel.messages.fetch(messageId);
            } catch {
                  interaction.reply({ 
                        content: "Unable to retrieve report/suggestion, it may have been removed.",
                        ephemeral: true
                  });

                  return;
            }

            const [embed] = reportMessage.embeds;

            const modal = new ModalBuilder()
                  .setTitle("Edit Submission")
                  .setCustomId(`edit-${type}-${messageId}`);

            const modalComponents: ActionRowBuilder<TextInputBuilder>[] = [];

            embed.data.fields?.forEach(field => {
                  if (!field.name.includes("Reason")) {
                        modalComponents.push(
                              new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                          .setCustomId(field.name.toLowerCase().replaceAll(" ", "_"))
                                          .setLabel(field.name)
                                          // .setMinLength(12)
                                          .setMaxLength(1024)
                                          .setValue(field.value)
                                          .setPlaceholder(`${field.name}...`)
                                          .setRequired(true)
                                          .setStyle(TextInputStyle.Paragraph)
                              ) as ActionRowBuilder<TextInputBuilder>
                        );
                  }
            });

            modal.addComponents(modalComponents);
            interaction.showModal(modal);
	}
}