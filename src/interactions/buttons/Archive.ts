import Button from "../../modules/interactions/buttons/Button";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {ButtonInteraction, TextChannel, NewsChannel, PermissionFlagsBits} from "discord.js";
import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {SubmissionType} from "../../data/Types";

export default class ArchiveButton extends Button {
    constructor(client: Bot) {
        super(client, {
            name: "archive",
            restriction: RestrictionLevel.Moderator,
            defer: true
        });
    }

    /**
     * @param {ButtonInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ButtonInteraction): Promise<void> {
        const embed = interaction.message.embeds[0].toJSON();

        let type: SubmissionType = "suggestions";

        switch (embed.title) {
            case "Bug Report": {
                type = "bugs";
                break;
            }

            case "Player Report": {
                type = "reports";
                break;
            }
        }

        const guildConfig = await Guild.findOne(
            {id: interaction.guildId},
            {
                ["channels.archive"]: 1,
                [type]: 1,
                _id: 0
            }
        );

        const isValid = guildConfig?.[type].some(report => report.messageId === interaction.message.id);

        if (!isValid) {
            await interaction.editReply(`This ${type.slice(0, -1)} is not located in the database.`);
            return;
        }

        const archiveChannelId = guildConfig?.channels.archive;

        if (!archiveChannelId) {
            await interaction.editReply(ErrorMessages.ChannelNotConfigured);
            return;
        }

        const archiveChannel = interaction.guild?.channels.cache.get(archiveChannelId) as TextChannel | NewsChannel;

        if (!await PermissionUtils.botHasPermissions({
            interaction,
            permissions: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel
            ],
            channel: archiveChannel,
            replyType: "EditReply"
        })) return;

        if (!await PermissionUtils.botHasPermissions({
            interaction,
            permissions: [
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ViewChannel
            ],
            channel: interaction.channel as TextChannel | NewsChannel,
            replyType: "EditReply"
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