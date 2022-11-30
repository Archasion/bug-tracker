import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
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

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

export default class EditCommand extends Command {
    constructor(client: Bot) {
        super(client, {
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
        const type = interaction.options.getString("type") as SubmissionType;
        const id = interaction.options.getNumber("id") as number;

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${type}.${id}`]: 1,
                [`channels.${type}`]: 1,
                _id: 0
            }
        );

        const submissionChannelId = guild?.channels[type];

        if (!submissionChannelId) {
            await interaction.reply({
                content: ErrorMessages.ChannelNotConfigured,
                ephemeral: true
            });
            return;
        }

        const submissionData = guild?.submissions[type][id];

        if (!submissionData) {
            await interaction.reply({
                content: `Unable to find report \`#${id}\``,
                ephemeral: true
            });
            return;
        }

        const {messageId, authorId} = submissionData;

        if (authorId !== interaction.user.id) {
            await interaction.reply({
                content: "You must be the author of the report in order to edit its content.",
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
                content: "Unable to retrieve report/suggestion, it may have been removed.",
                ephemeral: true
            });
            return;
        }

        const [embed] = submission.embeds;

        const modal = new ModalBuilder()
            .setTitle("Edit Submission")
            .setCustomId(`edit-${type}-${id}`);

        const modalComponents: ActionRowBuilder<TextInputBuilder>[] = [];

        embed.fields?.forEach(field => {
            if (!field.name.includes("Reason")) {
                modalComponents.push(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId(field.name.replaceAll(" ", "-"))
                            .setLabel(field.name)
                            .setMinLength(12)
                            .setMaxLength(1024)
                            .setValue(field.value)
                            .setPlaceholder(`${field.name}...`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ) as ActionRowBuilder<TextInputBuilder>
                );
            }
        });

        if (modalComponents.length === 0) {
            modalComponents.push(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("suggestion")
                        .setLabel("Suggestion")
                        .setMinLength(12)
                        .setMaxLength(4000)
                        .setPlaceholder("Suggestion...")
                        .setValue(embed.description as string)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph)
                ) as ActionRowBuilder<TextInputBuilder>
            );
        }

        modal.addComponents(modalComponents);
        await interaction.showModal(modal);
    }
}