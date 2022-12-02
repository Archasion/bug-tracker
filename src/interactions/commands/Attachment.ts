import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandNumericOptionData,
    ApplicationCommandStringOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    GuildMember,
    TextChannel,
    NewsChannel,
    Attachment
} from "discord.js";

import RestrictionUtils, {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

const submissionValidationOptions: (ApplicationCommandStringOptionData | ApplicationCommandNumericOptionData)[] = [
    {
        name: "type",
        description: "The submission type",
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
        description: "The submission ID",
        type: ApplicationCommandOptionType.Number,
        required: true
    }
]

export default class AttachmentCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "attachment",
            description: "Send announcement to all configured guilds.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "add",
                    description: "Attach an image to a submission",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        ...submissionValidationOptions,
                        {
                            name: "attachment",
                            description: "The image to attach",
                            type: ApplicationCommandOptionType.Attachment,
                            required: true
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Detach an image from a submission",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: submissionValidationOptions
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const action = interaction.options.getSubcommand();
        const submissionType = interaction.options.getString("type") as SubmissionType;
        const submissionId = interaction.options.getNumber("id") as number;

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${submissionType}.${submissionId}.messageId`]: 1,
                [`submissions.${submissionType}.${submissionId}.authorId`]: 1,
                ["settings.allowSubmissionAttachments"]: 1,
                [`channels.${submissionType}`]: 1,
                _id: 0
            }
        );

        const submissionData = guild?.submissions[submissionType][submissionId];

        if (!submissionData) {
            await interaction.editReply(`There is no submission of this type with the ID of \`#${submissionId}\`.`);
            return;
        }

        const isReviewer = await RestrictionUtils.isReviewer(interaction.member as GuildMember);

        if (guild?.submissions[submissionType][submissionId].authorId !== interaction.user.id && !isReviewer) {
            await interaction.editReply("You can only attach images to your own submission.");
            return;
        }

        if (!guild?.settings.allowSubmissionAttachments && !isReviewer) {
            await interaction.editReply("You must be a **Reviewer+** in order to use this command.");
            return;
        }

        const submissionChannelId = guild?.channels[submissionType];

        if (!submissionChannelId) {
            await interaction.editReply("There is no submission channel set up for this submission type.");
            return;
        }

        const submissionChannel = await interaction.guild?.channels.fetch(submissionChannelId) as TextChannel | NewsChannel;

        if (!submissionChannel) {
            await interaction.editReply("I am unable to fetch the submission channel.");
            return;
        }

        const submission = await submissionChannel.messages.fetch({message: submissionData.messageId, force: true});

        if (!submission) {
            await interaction.editReply("I am unable to fetch the submission.");
            return;
        }

        const [embed] = submission.embeds;
        const newEmbed = new EmbedBuilder(embed.toJSON());

        switch (action) {
            case "add": {
                if (embed.image) {
                    await interaction.editReply("This submission already has an attachment.");
                    return;
                }

                const attachment = interaction.options.getAttachment("attachment") as Attachment;

                if (!attachment.contentType?.match(/^image\/((?!svg).)*$/g)) {
                    await interaction.editReply("The attachment must be an image.");
                    return;
                }

                newEmbed.setImage(attachment?.url as string);
                break;
            }

            case "remove": {
                if (!embed.image) {
                    await interaction.editReply("This submission doesn't have an attachment.");
                    return;
                }

                newEmbed.setImage(null);
                break;
            }
        }

        submission.edit({embeds: [newEmbed]}).then(async () => {
            await interaction.editReply(`Successfully ${action === "add" ? `${action}ed` : `${action}d`} the attachment`);
            return;
        });

        return;
    }
}