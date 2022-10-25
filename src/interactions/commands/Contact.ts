import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ApplicationCommandOptionType
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

const enquiryDetails: { [key: string]: { [key: string]: string } } = {
    support: {
        label: "What are you looking to receive support with?",
        placeholder: "I need help with...",
    },
    suggestions: {
        label: "What are your suggestions for the bot?",
        placeholder: "e.g. Implement a new feature, alter a current feature, etc.",
    },
    bugs: {
        label: "Briefly describe the issue(s) encountered.",
        placeholder: "Bug description...",
    },
    feedback: {
        label: "What feedback do you have for the developer?",
        placeholder: "Bot feedback...",
    },
    other: {
        label: "Please enter your enquiry.",
        placeholder: "My enquiry is ... and ...",
    }
};

export default class ContactCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "contact",
            description: "Contact the bot's developer regarding an enquiry.",
            restriction: RestrictionLevel.Public,
            defer: true,
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: "enquiry",
                    description: "The enquiry to be made.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Bot support",
                            value: "support"
                        },
                        {
                            name: "Report any encountered bugs",
                            value: "bugs"
                        },
                        {
                            name: "Bot development suggestions",
                            value: "suggestions"
                        },
                        {
                            name: "Provide feedback",
                            value: "feedback"
                        },
                        {
                            name: "Other",
                            value: "other"
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
        const enquiry = interaction.options.getString("enquiry") as string;

        const modalComponents: ActionRowBuilder<TextInputBuilder>[] = [
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("description")
                    .setStyle(TextInputStyle.Paragraph)
                    .setLabel(enquiryDetails[enquiry].label)
                    .setPlaceholder(enquiryDetails[enquiry].placeholder)
                    .setMinLength(12)
                    .setRequired(true)
                    .setValue("")
            ) as ActionRowBuilder<TextInputBuilder>
        ];

        const modal = new ModalBuilder()
            .setTitle("Contact Form")
            .setCustomId(`contact-${enquiry}`);

        switch (enquiry) {
            case "bugs": {
                modalComponents.push(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("reproduction-steps")
                            .setStyle(TextInputStyle.Paragraph)
                            .setLabel("Steps to reproduce the bug (if applicable)")
                            .setPlaceholder("- Step 1: ...\n- Step 2: ...\n- Step 3: ...")
                            .setMaxLength(1024)
                            .setRequired(false)
                            .setValue("")
                    ) as ActionRowBuilder<TextInputBuilder>
                );

                break;
            }
        }

        modal.addComponents(modalComponents);
        await interaction.showModal(modal);
        return;
    }
}