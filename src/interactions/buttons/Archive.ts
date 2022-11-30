import Button from "../../modules/interactions/buttons/Button";
import PermissionUtils, {ReplyType} from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../database/models/Guild.model";
import Bot from "../../Bot";

import {ButtonInteraction, TextChannel, NewsChannel, PermissionFlagsBits} from "discord.js";
import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

export default class ArchiveButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "archive",
            restriction: RestrictionLevel.Reviewer,
            defer: true
        });
    }

    /**
     * @param {ButtonInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ButtonInteraction): Promise<void> {
        const embed = interaction.message.embeds[0].toJSON();
        const id = embed.footer!.text.replace("#", "");
        let type: SubmissionType = "suggestions";

        switch (embed.title) {
            case "Bug Report": {
                type = "bugReports";
                break;
            }

            case "Player Report": {
                type = "playerReports";
                break;
            }
        }

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {
                [`channels.archive.${type}`]: 1,
                [`submissions.${type}.${id}`]: 1,
                _id: 0
            }
        );

        const exists = guild?.submissions[type][id];

        if (!exists) {
            await interaction.editReply("This submission is not located in the database.");
            return;
        }

        const archiveChannelId = guild?.channels.archive[type];

        if (!archiveChannelId) {
            await interaction.editReply(ErrorMessages.ChannelNotConfigured);
            return;
        }

        const archiveChannel = interaction.guild?.channels.cache.get(archiveChannelId) as TextChannel | NewsChannel;

        if (!await PermissionUtils.verifyAccess({
            interaction,
            permissions: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel
            ],
            channel: archiveChannel,
            replyType: ReplyType.EditReply
        })) return;

        if (!await PermissionUtils.verifyAccess({
            interaction,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ViewChannel
            ],
            channel: interaction.channel as TextChannel | NewsChannel,
            replyType: ReplyType.EditReply
        })) return;

        if (interaction.message.hasThread) {
            await interaction.message.thread?.edit({
                archived: true,
                locked: true
            }).catch(() => console.log("Failed to archive thread"));
        }

        archiveChannel.send({
            content: interaction.message.content,
            embeds: [embed],
            files: []
        }).then(async () => {
            await interaction.message.delete();
            await interaction.editReply(`The ${type.slice(0, -1)} with the ID of \`${embed.footer?.text}\` has been archived.`);
        });

        return;
    }
}