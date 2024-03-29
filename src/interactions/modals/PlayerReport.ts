import Modal from "../../modules/interactions/modals/Modal";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
import Properties from "../../data/Properties";

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

export default class ReportPlayerModal extends Modal {
    constructor() {
        super({
            name: "player-report",
            restriction: RestrictionLevel.Public
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const player = interaction.fields.getTextInputValue("player");
        const reason = interaction.fields.getTextInputValue("reason");

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                ["channels.playerReports"]: 1,
                ["submissions.playerReports"]: 1,
                _id: 0
            }
        );

        const submissionChannelId = guild?.channels.playerReports;

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
            permissions: SubmissionChannelPermissions.PlayerReports,
            channel: submissionChannel,
            replyType: ReplyType.EditReply
        })) return;

        const submissionId = Object.keys(guild?.submissions.playerReports).length + 1;

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Player Report")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFields([
                {
                    name: "Reported Player",
                    value: player,
                },
                {
                    name: "Report Reason",
                    value: reason,
                }
            ])
            .setFooter({text: `#${submissionId}`})
            .setTimestamp();

        const setStatusButton = new ButtonBuilder()
            .setCustomId("set-status")
            .setLabel("Set Status")
            .setEmoji(Properties.emojis.edit)
            .setStyle(ButtonStyle.Primary);

        const archiveButton = new ButtonBuilder()
            .setCustomId("archive")
            .setLabel("Archive")
            .setEmoji(Properties.emojis.inbox)
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().setComponents(
            setStatusButton,
            archiveButton
        );

        submissionChannel.send({
            content: `${interaction.user} (\`${interaction.user.id}\`)`,
            embeds: [embed],
            components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
        }).then(async (message) => {
            const submissionData = {
                messageId: message.id,
                authorId: interaction.user.id,
                content: {
                    reportedPlayer: player,
                    reason
                }
            };

            await Guild.updateOne(
                {_id: interaction.guildId},
                {$set: {[`submissions.playerReports.${submissionId}`]: submissionData}}
            );

            message.react(Properties.emojis.thumbsUp);
            message.react(Properties.emojis.thumbsDown);

            await interaction.editReply("Your player report has been submitted");
        });

        return;
    }
}