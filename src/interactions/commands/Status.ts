import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
import Properties from "../../data/Properties";
import Media from "../../data/Media";
import Bot from "../../Bot";

import {
    ApplicationCommandNumericOptionData,
    ApplicationCommandStringOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonComponent,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    TextChannel,
    NewsChannel,
    ActionRow
} from "discord.js";

import {
    SubmissionStatus,
    SubmissionType,
    BugPriority,
    BugStatus
} from "../../data/Types";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

const forbiddenStatuses = {
    playerReports: ["Implemented", "Fixed", "NAB"],
    suggestions: ["Fixed", "Known", "NAB"],
    bugReports: ["Implemented"]
};

const typeAndIdSelection: (ApplicationCommandStringOptionData | ApplicationCommandNumericOptionData)[] = [
    {
        name: "type",
        description: "The submission type.",
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
        description: "The ID of the submission.",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }
];

export default class StatusCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "status",
            description: "Manage the status of a submission.",
            restriction: RestrictionLevel.Reviewer,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "set",
                    description: "Set a submission status.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        ...typeAndIdSelection,
                        {
                            name: "status",
                            description: "The status to set.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Approved",
                                    value: "Approved"
                                },
                                {
                                    name: "Rejected",
                                    value: "Rejected"
                                },
                                {
                                    name: "Known",
                                    value: "Known"
                                },
                                {
                                    name: "Not a Bug",
                                    value: "NAB"
                                },
                                {
                                    name: "Fixed",
                                    value: "Fixed"
                                },
                                {
                                    name: "Implemented",
                                    value: "Implemented"
                                },
                                {
                                    name: "Considered",
                                    value: "Considered"
                                }
                            ]
                        },
                        {
                            name: "reason",
                            description: "The status reason.",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Remove a submission status.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: typeAndIdSelection
                },
                {
                    name: "reason",
                    description: "Modify a status reason (must have a status).",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        ...typeAndIdSelection,
                        {
                            name: "reason",
                            description: "The new status reason.",
                            type: ApplicationCommandOptionType.String,
                            required: false
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
        const action = interaction.options.getSubcommand() as "set" | "remove" | "reason";
        const submissionType = interaction.options.getString("type") as SubmissionType;
        const submissionId = interaction.options.getNumber("id") as number;

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${submissionType}.${submissionId}`]: 1,
                ["settings.notifyOnStatusChange"]: 1,
                [`channels.${submissionType}`]: 1,
                _id: 0
            }
        );

        const submissionData = guild?.submissions[submissionType][submissionId];

        if (!submissionData) {
            await interaction.editReply(`Could not find submission with the ID \`#${submissionId}\`.`);
            return;
        }

        const submissionChannelId: string | null = guild?.channels[submissionType];

        if (!submissionChannelId) {
            await interaction.editReply(ErrorMessages.ChannelNotConfigured);
            return;
        }

        const submissionChannel = await interaction.guild?.channels.fetch(submissionChannelId) as TextChannel | NewsChannel;
        const submission = await submissionChannel.messages.fetch(submissionData.messageId);

        if (!submission) {
            await interaction.editReply("Unable to retrieve submission, it may have been removed.");
            return;
        }

        const embed = submission.embeds[0].toJSON();
        const attachmentFiles: AttachmentBuilder[] = [];

        const hasReasonField = embed.fields?.some(field => field.name === "Reason");
        let reasonField;

        if (hasReasonField) {
            reasonField = embed.fields?.find(field => field.name === "Reason");
            embed.fields?.pop();
        }

        if (!embed.fields) embed.fields = [];

        // Remove submission status
        if (action === "remove") {
            if (!embed.author?.name.includes("Status")) {
                await interaction.editReply("This submission does not have a status.");
                return;
            }

            if (submissionType !== "bugReports") {
                delete embed.author;
                embed.color = Properties.colors.default;
            } else {
                const submissionPriority = submissionData.priority as BugPriority;

                embed.author = {name: `Priority: ${submissionPriority.toUpperCase()}`};
                embed.color = Properties.colors.priority[submissionPriority];

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                embed.thumbnail!.url = `attachment://${submissionPriority}.png`;
                attachmentFiles.push(Media.priority[submissionPriority]);
            }

            submission.edit({
                embeds: [embed],
                files: attachmentFiles
            }).then(async () => {
                await interaction.editReply(`Removed status from submission \`#${submissionId}\`.`);
            });

            return;
        }

        const reason = interaction.options.getString("reason");
        if (reason) embed.fields?.push({name: "Reason", value: reason});

        // Change status reason
        if (action === "reason") {
            if (!embed.author?.name.includes("Status")) {
                await interaction.editReply("This submission does not have a status.");
                return;
            }

            if (!hasReasonField && !reason) {
                await interaction.editReply("You must provide a reason for the status.");
                return;
            }

            if (hasReasonField && reasonField?.value === reason) {
                await interaction.editReply("The reason is already set to this value.");
                return;
            }

            submission.edit({
                embeds: [embed],
                files: [],
                components: submission.components
            });

            await interaction.editReply(`Updated the reason for submission \`#${submissionId}\`.`);
            return;
        }

        const status = interaction.options.getString("status") as SubmissionStatus;

        if (embed.author?.name.includes(status)) {
            await interaction.editReply(`This submission's status is relady set to ${status}.`);
            return;
        }

        if (forbiddenStatuses[submissionType].includes(status)) {
            await interaction.editReply(`You cannot set the status of this submission to ${status}.`);
            return;
        }

        if (submissionType === "bugReports") {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.thumbnail!.url = `attachment://${status}.png`;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            attachmentFiles.push(Media.status[status as BugStatus]);
        }

        embed.color = Properties.colors.status[status];
        embed.author = {name: `Status: ${status} (By ${interaction.user.tag})`};

        submission.edit({
            embeds: [embed],
            files: attachmentFiles
        }).then(async () => {
            await interaction.editReply(`The status of submission \`#${submissionId}\` has been set to **${status}**.`);

            if (guild?.settings.notifyOnStatusChange) {
                const submissionAuthor = await interaction.guild?.members.fetch(submissionData.authorId);
                if (!submissionAuthor) return;

                const dmEmbed = new EmbedBuilder()
                    .setColor(Properties.colors.status[status])
                    .setTitle(`Your submission's status with the ID of #${submissionId} has been set to ${status}`)
                    .setDescription(`The status of your submission has been updated by ${interaction.user} (\`${interaction.user.id}\`).`)
                    .setTimestamp();

                const jumpUrl = new ButtonBuilder()
                    .setLabel("Jump to Submission")
                    .setStyle(ButtonStyle.Link)
                    .setURL(submission.url);

                const urlActionRow = new ActionRowBuilder().setComponents(jumpUrl);
                if (reason) dmEmbed.setFields([{name: "Reason", value: reason}]);

                submissionAuthor.send({
                    embeds: [dmEmbed],
                    components: [urlActionRow.toJSON() as ActionRow<ButtonComponent>]
                }).catch(() => console.log("Unable to notify submission author."));
            }
        });

        return;
    }
}