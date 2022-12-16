import Modal from "../../modules/interactions/modals/Modal";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
import StringUtils from "../../utils/StringUtils";
import Properties from "../../data/Properties";
import Media from "../../data/Media";

import {
    ModalSubmitInteraction,
    ActionRowBuilder,
    ButtonComponent,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    TextChannel,
    NewsChannel,
    ActionRow
} from "discord.js";

import PermissionUtils, {ReplyType, SubmissionChannelPermissions} from "../../utils/PermissionUtils";
import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {BugPriority} from "../../data/Types";

export default class BugReportModal extends Modal {
    constructor() {
        super({
            name: {startsWith: "bug-report"},
            restriction: RestrictionLevel.Public
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const summary = interaction.fields.getTextInputValue("summary");
        const description = interaction.fields.getTextInputValue("description");
        const reproductionSteps = interaction.fields.getTextInputValue("reproduction");
        const systemSpecs = interaction.fields.getTextInputValue("specs");
        const priority = interaction.customId.split("-")[2] as BugPriority;

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                ["settings.threads.bugReports"]: 1,
                ["channels.bugReports"]: 1,
                ["submissions.bugReports"]: 1,
                _id: 0
            }
        );

        const submissionChannelId = guild?.channels.bugReports;

        if (!submissionChannelId) {
            await interaction.editReply(ErrorMessages.ChannelNotConfigured);
            return;
        }

        const submissionChannel = await interaction.guild?.channels.fetch(submissionChannelId) as TextChannel | NewsChannel;

        if (!submissionChannel) {
            await interaction.editReply(ErrorMessages.ChannelNotFound);
            return;
        }

        if (!await PermissionUtils.verifyAccess({
            interaction,
            permissions: SubmissionChannelPermissions.BugReports,
            channel: submissionChannel,
            replyType: ReplyType.EditReply
        })) return;

        const submissionId = Object.keys(guild?.submissions.bugReports).length + 1;

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.priority[priority])
            .setAuthor({name: `Priority: ${priority}`})
            .setTitle("Bug Report")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFields([
                {
                    name: "Summary",
                    value: summary,
                },
                {
                    name: "Description",
                    value: description,
                }
            ])
            .setThumbnail(`attachment://${priority}.png`)
            .setFooter({text: `#${submissionId}`})
            .setTimestamp();

        if (reproductionSteps) {
            embed.data.fields?.push({
                name: "Reproduction Steps",
                value: reproductionSteps
            });
        }

        if (systemSpecs) {
            embed.data.fields?.push({
                name: "System Specs",
                value: systemSpecs
            });
        }

        const setStatusButton = new ButtonBuilder()
            .setCustomId("set-status")
            .setEmoji(Properties.emojis.edit)
            .setLabel("Set Status")
            .setStyle(ButtonStyle.Primary);

        const discussionThreadButton = new ButtonBuilder()
            .setCustomId("discussion-thread")
            .setEmoji(Properties.emojis.thread)
            .setLabel("Discussion Thread")
            .setStyle(ButtonStyle.Secondary);

        const archiveButton = new ButtonBuilder()
            .setCustomId("archive")
            .setEmoji(Properties.emojis.inbox)
            .setLabel("Archive")
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().setComponents(
            setStatusButton,
            discussionThreadButton,
            archiveButton
        );

        submissionChannel.send({
            content: `${interaction.user} (\`${interaction.user.id}\`)`,
            embeds: [embed],
            files: [Media.priority[priority]],
            components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
        }).then(async (message) => {
            const submissionData = {
                messageId: message.id,
                authorId: interaction.user.id,
                priority,
                content: {
                    summary,
                    description,
                    reproductionSteps,
                    systemSpecs
                }
            };

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!submissionData.content.reproductionSteps) delete submissionData.content.reproductionSteps;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!submissionData.content.systemSpecs) delete submissionData.content.systemSpecs;

            await Guild.updateOne(
                {_id: interaction.guildId},
                {$set: {[`submissions.bugReports.${submissionId}`]: submissionData}}
            );

            if (guild?.settings.threads.bugReports) {
                await message.startThread({
                    name: StringUtils.elipsify(summary, 100),
                    autoArchiveDuration: 10080, // 1 week
                    reason: "Submission discussion thread"
                });
            }

            message.react(Properties.emojis.thumbsUp);
            message.react(Properties.emojis.thumbsDown);

            await interaction.editReply("Your bug report has been submitted");
        });

        return;
    }
}