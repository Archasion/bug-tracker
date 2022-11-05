import Command from "../../modules/interactions/commands/Command";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ApplicationCommandChoicesData,
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

const priorityImage = {
    medium: new AttachmentBuilder("assets/priority/Medium.png", {name: "medium.png"}),
    none: new AttachmentBuilder("assets/priority/None.png", {name: "none.png"}),
    high: new AttachmentBuilder("assets/priority/High.png", {name: "high.png"}),
    low: new AttachmentBuilder("assets/priority/Low.png", {name: "low.png"})
};

const statusImage = {
    considered: new AttachmentBuilder("assets/status/Considered.png", {name: "considered.png"}),
    approved: new AttachmentBuilder("assets/status/Approved.png", {name: "approved.png"}),
    rejected: new AttachmentBuilder("assets/status/Rejected.png", {name: "rejected.png"}),
    fixed: new AttachmentBuilder("assets/status/Fixed.png", {name: "fixed.png"})
};

const forbiddenStatuses = {
    reports: ["implemented", "fixed", "nab"],
    suggestions: ["fixed", "known", "nab"],
    bugs: ["implemented"]
};

const typeAndIdOptions: ApplicationCommandChoicesData[] = [
    {
        name: "type",
        description: "The type of submission to manage the status of.",
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
        description: "The ID of the submission.",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }
];

export default class StatusCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "status",
            description: "Manage the status of a report or suggestion.",
            restriction: RestrictionLevel.Moderator,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "set",
                    description: "Set a status for a report or suggestion.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        ...typeAndIdOptions,
                        {
                            name: "status",
                            description: "The status to set.",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: "Approved",
                                    value: "approved"
                                },
                                {
                                    name: "Rejected",
                                    value: "rejected"
                                },
                                {
                                    name: "Known",
                                    value: "known"
                                },
                                {
                                    name: "Not a Bug",
                                    value: "nab"
                                },
                                {
                                    name: "Fixed",
                                    value: "fixed"
                                },
                                {
                                    name: "Implemented",
                                    value: "implemented"
                                },
                                {
                                    name: "Considered",
                                    value: "considered"
                                }
                            ]
                        },
                        {
                            name: "reason",
                            description: "The reason for the status.",
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: "remove",
                    description: "Remove a status from a report or suggestion.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: typeAndIdOptions
                },
                {
                    name: "reason",
                    description: "Set or change the reason of a status.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        ...typeAndIdOptions,
                        {
                            name: "reason",
                            description: "The reason for the status.",
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
        const type = interaction.options.getString("type") as SubmissionType;
        const id = interaction.options.getNumber("id") as number;

        const guildConfig = await Guild.findOne(
            {id: interaction.guildId},
            {
                [`channels.${type}`]: 1,
                ["auto.dm.status"]: 1,
                [type]: 1,
                _id: 0
            }
        );

        const submissionData = guildConfig?.[type].find(doc => doc.number === id);

        if (!submissionData) {
            await interaction.editReply(`Could not find submission with the ID \`#${id}\`.`);
            return;
        }

        const submissionChannelId: string = guildConfig?.channels[type];

        if (!submissionChannelId) {
            await interaction.editReply(ErrorMessages.ChannelNotConfigured);
            return;
        }

        const submissionChannel = interaction.guild?.channels.cache.get(submissionChannelId) as TextChannel | NewsChannel;
        const submission = await submissionChannel.messages.fetch(submissionData.messageId);

        if (!submission) {
            await interaction.editReply("Unable to retrieve report/suggestion, it may have been removed.");
            return;
        }

        const embed = submission.embeds[0].toJSON();
        const thumbnailFile: AttachmentBuilder[] = [];

        const hasReasonField = embed.fields?.some(field => field.name === "Reason");
        let reasonField;

        if (hasReasonField) {
            reasonField = embed.fields?.find(field => field.name === "Reason");
            embed.fields?.pop();
        }

        if (!embed.fields) embed.fields = [];

        if (action === "remove") {
            if (!embed.author?.name.includes("Status")) {
                await interaction.editReply("This submission does not have a status.");
                return;
            }

            if (type !== "bugs") {
                delete embed.author;
                embed.color = Properties.colors.default;
            } else {
                const priority = submissionData.priority.toLowerCase() as BugPriority;

                embed.author = {name: `Priority: ${priority.toUpperCase()}`};
                embed.color = Properties.colors.priority[priority];

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                embed.thumbnail!.url = `attachment://${priority}.png`;
                thumbnailFile.push(priorityImage[priority]);
            }

            submission.edit({
                embeds: [embed],
                files: thumbnailFile
            }).then(async () => {
                await interaction.editReply(`Removed status from **${type.slice(0, -1)}** \`#${id}\`.`);
            });

            return;
        }

        const reason = interaction.options.getString("reason");

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

            if (reason) embed.fields?.push({name: "Reason", value: reason});

            submission.edit({
                embeds: [embed],
                files: [],
                components: submission.components
            });

            await interaction.editReply(`Updated the reason for ${type.slice(0, -1)} \`#${id}\`.`);
            return;
        }

        const status = interaction.options.getString("status") as SubmissionStatus;

        if (embed.author?.name.includes(status.toUpperCase())) {
            await interaction.editReply(`This submission has already been ${status}.`);
            return;
        }

        if (forbiddenStatuses[type].includes(status)) {
            await interaction.editReply(`You cannot set the status of **${type}** to **${status}**.`);
            return;
        }

        if (type === "bugs") {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.thumbnail!.url = `attachment://${status}.png`;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            thumbnailFile.push(statusImage[status as BugStatus]);
        }

        embed.color = Properties.colors.status[status];
        embed.author = {name: `Status: ${status.toUpperCase()} (By ${interaction.user.tag})`};

        if (reason) embed.fields?.push({name: "Reason", value: reason});

        submission.edit({
            embeds: [embed],
            files: thumbnailFile
        }).then(async () => {
            await interaction.editReply(`Set the status of **${type.slice(0, -1)}** \`#${id}\` to **${status}**.`);

            if (guildConfig?.auto.dm.status) {
                const submissionAuthor = await interaction.guild?.members.fetch(submissionData.author);
                if (!submissionAuthor) return;

                const dmEmbed = new EmbedBuilder()
                    .setColor(Properties.colors.status[status])
                    .setTitle(`Your ${type.slice(0, -1)} with the ID of #${id} has been ${status}`)
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
                }).catch(() => console.log("Unable to DM submission author."));
            }
        });

        return;
    }
}