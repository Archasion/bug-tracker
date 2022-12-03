import Modal from "../../modules/interactions/modals/Modal";
import Guild from "../../database/models/Guild.model";
import ErrorMessages from "../../data/ErrorMessages";
import Bot from "../../Bot";

import {
    ModalSubmitInteraction,
    PermissionFlagsBits,
    APIEmbedField,
    EmbedBuilder,
    TextChannel,
    NewsChannel,
    Message
} from "discord.js";

import PermissionUtils, {ReplyType} from "../../utils/PermissionUtils";
import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class EditModal extends Modal {
    constructor(client: Bot) {
        super(client, {
            name: {startsWith: "edit"},
            restriction: RestrictionLevel.Public
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const [_, submissionType, submissionId] = interaction.customId.split("-");

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`submissions.${submissionType}.${submissionId}`]: 1,
                [`channels.${submissionType}`]: 1,
                _id: 0
            }
        );

        const submission = guild?.submissions[submissionType][submissionId];

        if (!submission) {
            await interaction.editReply(ErrorMessages.SubmissionNotFound);
            return;
        }

        const submissionChannelId = guild?.channels[submissionType];

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
            permissions: [
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ViewChannel
            ],
            channel: submissionChannel,
            replyType: ReplyType.EditReply
        })) return;

        const message = await submissionChannel.messages.fetch(submission.messageId);

        if (!message) {
            await interaction.editReply(ErrorMessages.SubmissionNotFound);
            return;
        }

        const [embed] = message.embeds;
        const newEmbed = new EmbedBuilder(embed.toJSON());
        const newFields: APIEmbedField[] = [];

        for (const fieldData of interaction.fields.fields) {
            const [customId, field] = fieldData;

            let contentName = customId.replaceAll("-", "");
            contentName = contentName[0].toLowerCase() + contentName.slice(1);
            if (contentName === "reportReason") contentName = "reason";

            if (customId === "suggestion") {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`submissions.${submissionType}.${submissionId}.content`]: field.value}}
                );

                newEmbed.setDescription(field.value);
            } else if (field.value) {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$set: {[`submissions.${submissionType}.${submissionId}.content.${contentName}`]: field.value}}
                );

                newFields.push({
                    name: customId.replaceAll("-", " "),
                    value: field.value
                });
            } else {
                await Guild.updateOne(
                    {_id: interaction.guildId},
                    {$unset: {[`submissions.${submissionType}.${submissionId}.content.${contentName}`]: 1}}
                )
            }
        }

        if (newFields.length > 0) newEmbed.setFields(newFields);

        message.edit({
            embeds: [newEmbed],
            files: []
        }).then(async () => {
            await interaction.editReply("Successfully edited your submission!");
        });

        return;
    }
}