import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";

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

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

export default class EditCommand extends Command {
    constructor() {
        super({
            name: "edit",
            description: "Edit your submissions.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: false, // Model response
            options: [
                {
                    name: "type",
                    description: "The type of submission.",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Bug Report",
                            value: "bugReports"
                        },
                        {
                            name: "Player Report",
                            value: "playerReports"
                        },
                        {
                            name: "Suggestion",
                            value: "suggestions"
                        }
                    ]
                },
                {
                    name: "id",
                    description: "The number in the submission's footer.",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const submissionType = interaction.options.getString("type") as SubmissionType;
        const submissionId = interaction.options.getNumber("id") as number;

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${submissionType}.${submissionId}`]: 1,
                [`channels.${submissionType}`]: 1,
                _id: 0
            }
        );

        const submissionChannelId = guild?.channels[submissionType];

        if (!submissionChannelId) {
            await interaction.reply({
                content: ErrorMessages.ChannelNotConfigured,
                ephemeral: true
            });
            return;
        }

        const submissionData = guild?.submissions[submissionType][submissionId];

        if (!submissionData) {
            await interaction.reply({
                content: `Unable to find submission \`#${submissionId}\``,
                ephemeral: true
            });
            return;
        }

        const {messageId, authorId} = submissionData;

        if (authorId !== interaction.user.id) {
            await interaction.reply({
                content: "You must be the author of the submisonsi in order to edit its content.",
                ephemeral: true
            });
            return;
        }

        const submissionChannel = await interaction.guild?.channels.fetch(submissionChannelId) as TextChannel | NewsChannel;

        if (!submissionChannel) {
            await interaction.reply({
                content: "The submission channel has either been removed or I no longer have access to it.",
                ephemeral: true
            });
            return;
        }

        const submission = await submissionChannel.messages.fetch(messageId);

        if (!submission) {
            await interaction.reply({
                content: "Unable to retrieve submission, it may have been removed.",
                ephemeral: true
            });
            return;
        }

        const [embed] = submission.embeds;

        const modal = new ModalBuilder()
            .setTitle("Edit Submission")
            .setCustomId(`edit-${submissionType}-${submissionId}`);

        const modalComponents: ActionRowBuilder<TextInputBuilder>[] = [];

        switch (submissionType) {
            case "bugReports": {
                const [summaryField, descriptionField] = embed.fields;
                const reproductionStepsField = embed.fields.find(field => field.name === "Reproduction Steps");
                const systemSpecsField = embed.fields.find(field => field.name === "System Specs");

                modalComponents.push(...[
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Summary")
                            .setLabel("Summary")
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(summaryField.value)
                            .setPlaceholder(`Enter summary...`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    ) as ActionRowBuilder<TextInputBuilder>,

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Description")
                            .setLabel("Description")
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(descriptionField.value)
                            .setPlaceholder(`Enter description...`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>,

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Reproduction-Steps")
                            .setLabel("Reproduction Steps")
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(reproductionStepsField?.value ?? "")
                            .setPlaceholder(`Enter reproduction steps...`)
                            .setRequired(false)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>,

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("System-Specs")
                            .setLabel("System Specs")
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(systemSpecsField?.value ?? "")
                            .setPlaceholder(`Enter system specs...`)
                            .setRequired(false)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>
                ]);

                break;
            }

            case "playerReports": {
                const [reportedPlayerField, reportReasonField] = embed.fields;
                modalComponents.push(...[
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Reported-Player")
                            .setLabel("Reported Player")
                            .setMinLength(1)
                            .setMaxLength(1024)
                            .setValue(reportedPlayerField?.value ?? "")
                            .setPlaceholder(`Enter reported player...`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    ) as ActionRowBuilder<TextInputBuilder>,

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Report-Reason")
                            .setLabel("Report Reason")
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(reportReasonField?.value ?? "")
                            .setPlaceholder(`Enter report reason...`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>
                ]);

                break;
            }

            case "suggestions": {
                modalComponents.push(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("Suggestion")
                            .setLabel("Suggestion")
                            .setMinLength(12)
                            .setMaxLength(4000)
                            .setPlaceholder("Enter suggestion...")
                            .setValue(embed.description as string)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>
                );
            }
        }

        modal.addComponents(modalComponents);
        await interaction.showModal(modal);
    }
}