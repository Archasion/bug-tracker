import Modal from "../../modules/interactions/modals/Modal";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
import StringUtils from "../../utils/StringUtils";
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

export default class SuggestModal extends Modal {
    constructor() {
        super({
            name: "suggestion",
            restriction: RestrictionLevel.Public
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const suggestion = interaction.fields.getTextInputValue("suggestion");

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                ["settings.threads.suggestions"]: 1,
                ["channels.suggestions"]: 1,
                ["submissions.suggestions"]: 1,
                _id: 0
            }
        );

        const submissionChannelId = guild?.channels.suggestions;

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
            permissions: SubmissionChannelPermissions.Suggestions,
            channel: submissionChannel,
            replyType: ReplyType.EditReply
        })) return;

        const submissionId = Object.keys(guild?.submissions.suggestions).length + 1;

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Suggestion")
            .setDescription(suggestion)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({text: `#${submissionId}`})
            .setTimestamp();

        const setStatusButton = new ButtonBuilder()
            .setCustomId("set-status")
            .setLabel("Set Status")
            .setEmoji(Properties.emojis.edit)
            .setStyle(ButtonStyle.Primary);

        const discussionThreadButton = new ButtonBuilder()
            .setCustomId("discussion-thread")
            .setLabel("Discussion Thread")
            .setEmoji(Properties.emojis.thread)
            .setStyle(ButtonStyle.Secondary);

        const archiveButton = new ButtonBuilder()
            .setCustomId("archive")
            .setLabel("Archive")
            .setEmoji(Properties.emojis.inbox)
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().setComponents(
            setStatusButton,
            discussionThreadButton,
            archiveButton
        );

        submissionChannel.send({
            content: `${interaction.user} (\`${interaction.user.id}\`)`,
            embeds: [embed],
            components: [actionRow.toJSON() as ActionRow<ButtonComponent>]
        }).then(async (message) => {
            await Guild.updateOne(
                {_id: interaction.guildId},
                {
                    $set: {
                        [`submissions.suggestions.${submissionId}`]: {
                            messageId: message.id,
                            authorId: interaction.user.id,
                            content: suggestion
                        }
                    }
                }
            );

            message.react(Properties.emojis.thumbsUp);
            message.react(Properties.emojis.thumbsDown);

            if (guild?.settings.threads.suggestions) {
                await message.startThread({
                    name: StringUtils.elipsify(suggestion, 100),
                    autoArchiveDuration: 10080, // 1 week
                    reason: "Submission discussion thread"
                });
            }

            await interaction.editReply("Your suggestion has been submitted");
        });

        return;
    }
}