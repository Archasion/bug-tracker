import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import PermissionUtils from "../../utils/PermissionUtils";
import ErrorMessages from "../../data/ErrorMessages";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
    SelectMenuInteraction,
    PermissionFlagsBits,
    SelectMenuBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    TextChannel,
    NewsChannel,
    ModalBuilder
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class SubmissionTypeSelectMenu extends SelectMenu {
    constructor(client: Bot) {
        super(client, {
            name: "submission-type",
            restriction: RestrictionLevel.Public,
            defer: false
        });
    }

    /**
     * @param {SelectMenuInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: SelectMenuInteraction): Promise<void> {
        const [submissionType] = interaction.values;
        const modalComponents = [];

        if (submissionType === "bug-report") {
            const guild = await Guild.findOne(
                {_id: interaction.guildId},
                {["channels.bugReports"]: 1, _id: 0}
            );

            if (!guild?.channels.bugReports) {
                await interaction.update({
                    content: ErrorMessages.ChannelNotConfigured,
                    components: []
                });
                return;
            }

            const submissionChannel = interaction.guild?.channels.cache.get(guild?.channels.bugReports) as TextChannel | NewsChannel;

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
                replyType: "Update"
            })) return;

            const bugPriority = new SelectMenuBuilder()
                .setCustomId("bug-priority")
                .setPlaceholder("Select the bug priority...")
                .setOptions([
                    {
                        label: "None",
                        value: "None",
                    },
                    {
                        label: "Low",
                        value: "Low",
                    },
                    {
                        label: "Medium",
                        value: "Medium",
                    },
                    {
                        label: "High",
                        value: "High",
                    }
                ]);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const disabledSubmissionType = new SelectMenuBuilder(interaction.component.toJSON());
            disabledSubmissionType.setDisabled(true);

            const priorityActionRow = new ActionRowBuilder().setComponents(bugPriority);
            const typeActionRow = new ActionRowBuilder().setComponents(disabledSubmissionType);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await interaction.update({components: [typeActionRow, priorityActionRow]});

            // await interaction.message.edit({ components: interaction.message.components });
            return;
        }

        if (submissionType === "suggestion") {
            const guild = await Guild.findOne(
                {_id: interaction.guildId},
                {["channels.suggestions"]: 1, _id: 0}
            );

            if (!guild?.channels.suggestions) {
                await interaction.update({
                    content: ErrorMessages.ChannelNotConfigured,
                    components: []
                });
                return;
            }

            const submissionChannel = interaction.guild?.channels.cache.get(guild?.channels.suggestions) as TextChannel | NewsChannel;

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
                replyType: "Update"
            })) return;

            const suggestionInput = new TextInputBuilder()
                .setCustomId("suggestion")
                .setLabel("Suggestion")
                .setPlaceholder("Enter your suggestion...")
                .setMinLength(12)
                .setMaxLength(1024)
                .setRequired(true)
                .setStyle(TextInputStyle.Paragraph)
                .setValue("");

            modalComponents.push(new ActionRowBuilder().addComponents(suggestionInput) as ActionRowBuilder<TextInputBuilder>);
        }

        if (submissionType === "player-report") {
            const guild = await Guild.findOne(
                {_id: interaction.guildId},
                {["channels.playerReports"]: 1, _id: 0}
            );

            if (!guild?.channels.playerReports) {
                await interaction.update({
                    content: ErrorMessages.ChannelNotConfigured,
                    components: []
                });
                return;
            }

            const submissionChannel = interaction.guild?.channels.cache.get(guild?.channels.playerReports) as TextChannel | NewsChannel;

            if (!await PermissionUtils.botHasPermissions({
                interaction,
                permissions: [
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.EmbedLinks
                ],
                channel: submissionChannel,
                replyType: "Update"
            })) return;

            modalComponents.push(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("player")
                        .setLabel("Player to Report")
                        .setMinLength(1)
                        .setMaxLength(1024)
                        .setPlaceholder("e.g. John Doe")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>,

                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("reason")
                        .setLabel("Reason")
                        .setMinLength(12)
                        .setMaxLength(1024)
                        .setPlaceholder("The reason is...")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph)
                        .setValue("")
                ) as ActionRowBuilder<TextInputBuilder>
            );
        }

        const modal = new ModalBuilder()
            .setCustomId(submissionType)
            .setTitle(submissionType === "suggestion" ? "Suggestion" : "Player Report")
            .addComponents(modalComponents);

        await interaction.showModal(modal);
        return;
    }
}