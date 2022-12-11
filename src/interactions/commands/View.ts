import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Properties from "../../data/Properties";
import Media from "../../data/Media";

import {
    ApplicationCommandNumericOptionData,
    MessageActionRowComponentData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ActionRowBuilder,
    ActionRowData,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    Client
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {BugPriority} from "../../data/Types";

const submissionIdInput: ApplicationCommandNumericOptionData[] = [
    {
        name: "id",
        description: "The ID of the submission.",
        type: ApplicationCommandOptionType.Number,
        required: true
    }
];

export default class ViewCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "view",
            description: "View a submission.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "bug_report",
                    description: "View a bug report.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: submissionIdInput
                },
                {
                    name: "player_report",
                    description: "View a player report.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: submissionIdInput
                },
                {
                    name: "suggestion",
                    description: "View a suggestion.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: submissionIdInput
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let submissionType = interaction.options.getSubcommand();
        const submissionId = interaction.options.getNumber("id") as number;

        switch (submissionType) {
            case "bug_report":
                submissionType = "bugReports";
                break;
            case "player_report":
                submissionType = "playerReports";
                break;
            case "suggestion":
                submissionType = "suggestions";
                break;
        }

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${submissionType}.${submissionId}`]: 1,
                [`channels.${submissionType}`]: 1,
                _id: 0
            }
        );

        const submission = guild?.submissions[submissionType][submissionId];
        const submissionChannelId = guild?.channels[submissionType];
        const attachmentFiles = [];

        if (!submission) {
            await interaction.editReply(`There are no submissions of this type with the ID of \`${submissionId}\``);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setThumbnail(interaction.guild?.iconURL() as string | null)
            .setFooter({text: `#${submissionId}`});

        switch (submissionType) {
            case "bugReports": {
                attachmentFiles.push(Media.priority[submission.priority as BugPriority]);

                embed.setColor(Properties.colors.priority[submission.priority as BugPriority])
                embed.setThumbnail(`attachment://${submission.priority}.png`);
                embed.setAuthor({name: `Priority: ${submission.priority}`});
                embed.setFields([
                    {
                        name: "Summary",
                        value: submission.content.summary
                    },
                    {
                        name: "Description",
                        value: submission.content.description
                    }
                ]);

                if (submission.content.reproductionSteps)
                    embed.data.fields?.push({
                        name: "Reproduction Steps",
                        value: submission.content.reproductionSteps
                    });

                if (submission.content.systemSpecs)
                    embed.data.fields?.push({
                        name: "System Specs",
                        value: submission.content.systemSpecs
                    });

                break;
            }

            case "playerReports": {
                const submissionAuthor = await this.client.users.fetch(submission.authorId);
                embed.setThumbnail(submissionAuthor.displayAvatarURL());
                embed.setFields([
                    {
                        name: "Reported Player",
                        value: submission.content.reportedPlayer
                    },
                    {
                        name: "Reason",
                        value: submission.content.reason
                    }
                ]);
                break;
            }

            case "suggestions": {
                const submissionAuthor = await this.client.users.fetch(submission.authorId);

                embed.setTitle("Suggestion");
                embed.setThumbnail(submissionAuthor.displayAvatarURL());
                embed.setDescription(submission.content);
                break;
            }
        }

        const jumpToSubmission = new ButtonBuilder()
            .setLabel("Jump to Submission")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${interaction.guildId}/${submissionChannelId}/${submission.messageId}`);

        const actionRow = new ActionRowBuilder()
        .setComponents(jumpToSubmission)
        .toJSON() as ActionRowData<MessageActionRowComponentData>;

        await interaction.editReply({
            content: `<@${submission.authorId}> (\`${submission.authorId}\`)`,
            embeds: [embed],
            components: [actionRow],
            files: attachmentFiles
        });
    }
}