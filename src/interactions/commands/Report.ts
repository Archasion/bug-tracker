import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import { 
      ApplicationCommandOptionType, 
      ChatInputCommandInteraction, 
      ApplicationCommandType,
      ActionRowBuilder,
      TextInputBuilder,
      TextInputStyle,
      ModalBuilder
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class GuideCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "report",
			description: "Submit a bug and/or player report for the server staff to review.",
			restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
                  modalResponse: true,
			options: [
                        {
                              name: "player",
					description: "Submit a player report for the server staff to review.",
					type: ApplicationCommandOptionType.Subcommand,
                        },
                        {
                              name: "bug",
					description: "Submit a bug report for the server staff to review.",
					type: ApplicationCommandOptionType.Subcommand,
                              options: [
                                    {
                                          name: "priority",
                                          description: "The severity of the bug.",
                                          type: ApplicationCommandOptionType.String,
                                          required: false,
                                          choices: [
                                                {
                                                      name: "None",
                                                      value: "none"
                                                },
                                                {
                                                      name: "Low",
                                                      value: "low"
                                                },
                                                {
                                                      name: "Medium",
                                                      value: "medium"
                                                },
                                                {
                                                      name: "High",
                                                      value: "high"
                                                }
                                          ]
                                    }
                              ]
				}
			]
		});
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
            const priority = interaction.options.getString("priority") ?? "none";
            const type = interaction.options.getSubcommand();
            const modalComponents: ActionRowBuilder<TextInputBuilder>[] = [];

            const report = new ModalBuilder()
                  .setCustomId(`${type}-report${type === "bug" ? `-${priority}` : ""}`)
                  .setTitle("Report Form");

            switch (type) {
                  case "player": {
                        modalComponents.push(
                              new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                          .setCustomId("player")
                                          .setLabel("Player to Report")
                                          .setMinLength(1)
                                          .setMaxLength(1024)
                                          .setPlaceholder("e.g. John Doe")
                                          .setRequired(true)
                                          .setStyle(TextInputStyle.Short)
                                          .setValue("")
                              ) as ActionRowBuilder<TextInputBuilder>,
            
                              new ActionRowBuilder().addComponents(
                                    new TextInputBuilder()
                                          .setCustomId("reason")
                                          .setLabel("Reason")
                                          .setMinLength(12)
                                          .setMaxLength(1024)
                                          .setPlaceholder("The reason is...")
                                          .setRequired(true)
                                          .setStyle(TextInputStyle.Paragraph)
                                          .setValue("")
                              ) as ActionRowBuilder<TextInputBuilder>
                        );

                        break;
                  }

                  case "bug": {
                        modalComponents.push(
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
                        );

                        break;
                  }
            }

            report.addComponents(modalComponents);
            await interaction.showModal(report);
            return;
	}
}