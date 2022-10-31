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

export default class SuggestModal extends Modal {
    constructor(client: Bot) {
        super(client, {
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

        const guildConfig = await Guild.findOne(
            {id: interaction.guildId},
            {
                ["auto.threads.suggestions"]: 1,
                ["channels.suggestions"]: 1,
                suggestions: 1,
                _id: 0
            }
        );

        const submissionChannelId = guildConfig?.channels.suggestions;

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
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.EmbedLinks
            ],
            channel: submissionChannel,
            replyType: "EditReply"
        })) return;

        const submissionId = guildConfig?.suggestions.length + 1;

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
                {id: interaction.guildId},
                {
                    $push: {
                        suggestions: {
                            number: submissionId,
                            messageId: message.id,
                            author: interaction.user.id,
                            suggestion
                        }
                    }
                }
            );

            message.react(Properties.emojis.thumbsUp);
            message.react(Properties.emojis.thumbsDown);

            if (guildConfig?.auto.threads.suggestions) {
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