import SelectMenu from "../../modules/interactions/select_menus/SelectMenu";
import Guild from "../../database/models/Guild.model";

import {
    SelectMenuInteraction,
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonComponent,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    ActionRow
} from "discord.js";

import {SubmissionStatus, SubmissionType, BugPriority} from "../../data/Types";
import {RestrictionLevel} from "../../utils/RestrictionUtils";

import Properties from "../../data/Properties";
import Media from "../../data/Media";

export default class SetStatusSelectMenu extends SelectMenu {
    constructor() {
        super({
            name: {startsWith: "set-status"},
            restriction: RestrictionLevel.Reviewer,
            defer: false
        });
    }

    /**
     * @param {SelectMenuInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: SelectMenuInteraction): Promise<void> {
        const messageId = interaction.customId.split("-")[2];
        const message = await interaction.channel?.messages.fetch(messageId);
        const status = interaction.values[0] as SubmissionStatus;

        if (!message) {
            await interaction.reply({
                content: "Unable to retrieve original message.",
                ephemeral: true
            });
            return;
        }

        const embed = message.embeds[0].toJSON();

        if (embed.author?.name.includes(status)) {
            await interaction.reply({
                content: `This submission's status has already been set to **${status}**`,
                ephemeral: true
            });
            return;
        }

        let type = embed.title;

        switch (type) {
            case "Suggestion": {
                type = "suggestions";
                break;
            }

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
                ["settings.notifyOnStatusChange"]: 1,
                [`submissions.${type}`]: 1,
                _id: 0
            }
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const submissionData = guild?.submissions[type as SubmissionType][embed.footer!.text.replace("#", "")];
        const thumbnailFile: AttachmentBuilder[] = [];


        if (type === "bugReports" && status === "None") {
            const priority = submissionData.priority as BugPriority;

            embed.author = {name: `Priority: ${priority}`};
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            embed.thumbnail!.url = `attachment://${priority}.png`;
            // @ts-ignore
            embed.color = Properties.colors.priority[priority];

            thumbnailFile.push(Media.priority[priority]);
        }

        const hasReasonField = embed.fields?.some(field => field.name === "Reason");
        if (hasReasonField) embed.fields?.pop();

        if (status !== "None") {
            embed.author = {name: `Status: ${status} (By ${interaction.user.tag})`};
            // @ts-ignore
            embed.color = Properties.colors.status[status as SubmissionStatus];

            if (type === "bugReports") {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                embed.thumbnail!.url = `attachment://${status}.png`;
                thumbnailFile.push(Media.status[status as Exclude<SubmissionStatus, "Implemented" | "None">]);
            }
        } else {
            if (type !== "bugReports") {
                delete embed.author;
                // @ts-ignore
                embed.color = Properties.colors.default;
            }
        }

        message.edit({
            embeds: [embed],
            files: thumbnailFile
        }).then(async () => {
            await interaction.update({
                content: `The submission status has successfully been set to **${status}**`,
                components: []
            });

            await interaction.deleteReply();

            if (guild?.settings.notifyOnStatusChange && status !== "None") {
                const submissionAuthor = await interaction.guild?.members.fetch(submissionData.authorId);
                if (!submissionAuthor) return;

                const dmEmbed = new EmbedBuilder()
                    .setColor(Properties.colors.status[status])
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    .setTitle(`Your ${type?.slice(0, -1)} with the ID of #${embed.footer!.text.replace("#", "")} has been ${status}`)
                    .setDescription(`The status of your submission has been updated by ${interaction.user} (\`${interaction.user.id}\`).`)
                    .setTimestamp();

                const jumpUrl = new ButtonBuilder()
                    .setLabel("Jump to Submission")
                    .setStyle(ButtonStyle.Link)
                    .setURL(message.url);

                const urlActionRow = new ActionRowBuilder().setComponents(jumpUrl);

                submissionAuthor.send({
                    embeds: [dmEmbed],
                    components: [urlActionRow.toJSON() as ActionRow<ButtonComponent>]
                }).catch(() => console.log("Unable to notify submission author."));
            }
        });

        return;
    }
}