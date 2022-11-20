import Modal from "../../modules/interactions/modals/Modal";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
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

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

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
        const args = interaction.customId.split("-");
        const type = args[1] as SubmissionType;
        const id = args[2];

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`channels.${type}`]: 1,
                [`submissions.${type}.${id}`]: 1,
                _id: 0
            }
        );

        const submission = guild?.submissions[type][id];

        if (!submission) {
            await interaction.editReply(ErrorMessages.SubmissionNotFound);
            return;
        }

        if (submission.authorId !== interaction.user.id) {
            await interaction.editReply("Only the author of the submission can edit it.");
            return;
        }

        const submissionChannelId = guild?.channels.submissions[type];

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
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ViewChannel
            ],
            channel: submissionChannel,
            replyType: "EditReply"
        })) return;

        const message = await submissionChannel.messages.fetch(submission.messageId)
            .catch(async () => {
                await interaction.editReply(ErrorMessages.SubmissionNotFound);
                return;
            }) as Message;

        const [embed] = message.embeds;
        const newEmbed = new EmbedBuilder(embed.toJSON());

        const newFields: APIEmbedField[] = [];

        interaction.fields.fields.forEach(field => {
            if (field.customId === "suggestion") {
                newEmbed.setDescription(field.value);
            } else {
                newFields.push({
                    name: field.customId.replaceAll("-", " "),
                    value: field.value
                });
            }
        });

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