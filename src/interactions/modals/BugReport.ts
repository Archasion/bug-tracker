import Modal from "../../modules/interactions/modals/Modal";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import StringUtils from "../../utils/StringUtils";
import Guild from "../../db/models/Guild.model";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ModalSubmitInteraction,
    PermissionFlagsBits,
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

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {BugPriority} from "../../data/Types";

const priorityImage = {
    High: new AttachmentBuilder("assets/priority/High.png", {name: "High.png"}),
    Medium: new AttachmentBuilder("assets/priority/Medium.png", {name: "Medium.png"}),
    Low: new AttachmentBuilder("assets/priority/Low.png", {name: "Low.png"}),
    None: new AttachmentBuilder("assets/priority/None.png", {name: "None.png"})
};

export default class BugReportModal extends Modal {
    constructor(client: Bot) {
        super(client, {
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

        const submissionChannel = interaction.guild?.channels.cache.get(submissionChannelId) as TextChannel | NewsChannel;

        if (!submissionChannel) {
            await interaction.editReply(ErrorMessages.ChannelNotFound);
            return;
        }

        if (!await PermissionUtils.botHasPermissions({
            interaction,
            permissions: [
                PermissionFlagsBits.SendMessagesInThreads,
                PermissionFlagsBits.CreatePublicThreads,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.ManageThreads,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.EmbedLinks
            ],
            channel: submissionChannel,
            replyType: "EditReply"
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
            files: [priorityImage[priority]],
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