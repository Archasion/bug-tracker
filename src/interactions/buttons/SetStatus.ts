import Button from "../../modules/interactions/buttons/Button";
import Properties from "../../data/Properties";

import {
    ComponentEmojiResolvable,
    StringSelectMenuBuilder,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client
} from "discord.js";

import {BugStatus, SuggestionStatus, PlayerReportStatus, SubmissionStatus} from "../../data/Types";
import {RestrictionLevel} from "../../utils/RestrictionUtils";

const suggestionStatuses: { label: string, value: SuggestionStatus, emoji: ComponentEmojiResolvable }[] = [
    {
        label: "Approved",
        value: "Approved",
        emoji: Properties.emojis.approve
    },
    {
        label: "Rejected",
        value: "Rejected",
        emoji: Properties.emojis.reject
    },
    {
        label: "Implemented",
        value: "Implemented",
        emoji: Properties.emojis.implemented
    },
    {
        label: "Considered",
        value: "Considered",
        emoji: Properties.emojis.considered
    },
    {
        label: "None",
        value: "None",
        emoji: Properties.emojis.none
    }
];

const bugStatuses: { label: string, value: BugStatus, emoji: ComponentEmojiResolvable }[] = [
    {
        label: "Approved",
        value: "Approved",
        emoji: Properties.emojis.approve
    },
    {
        label: "Rejected",
        value: "Rejected",
        emoji: Properties.emojis.reject
    },
    {
        label: "Known",
        value: "Known",
        emoji: Properties.emojis.known
    },
    {
        label: "Not a Bug",
        value: "NAB",
        emoji: Properties.emojis.nab
    },
    {
        label: "Fixed",
        value: "Fixed",
        emoji: Properties.emojis.fixed
    },
    {
        label: "Considered",
        value: "Considered",
        emoji: Properties.emojis.considered
    },
    {
        label: "None",
        value: "None",
        emoji: Properties.emojis.none
    }
];

const playerReportStatuses: { label: string, value: PlayerReportStatus, emoji: ComponentEmojiResolvable }[] = [
    {
        label: "Approved",
        value: "Approved",
        emoji: Properties.emojis.approve
    },
    {
        label: "Rejected",
        value: "Rejected",
        emoji: Properties.emojis.reject
    },
    {
        label: "Known",
        value: "Known",
        emoji: Properties.emojis.known
    },
    {
        label: "Considered",
        value: "Considered",
        emoji: Properties.emojis.considered
    },
    {
        label: "None",
        value: "None",
        emoji: Properties.emojis.none
    }
];


export default class SetStatusButton extends Button {
    constructor(client: Client) {
        super(client, {
            name: "set-status",
            restriction: RestrictionLevel.Reviewer,
            defer: true
        });
    }

    /**
     * @param {ButtonInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ButtonInteraction): Promise<void> {
        const [embed] = interaction.message.embeds;
        const submissionType = embed.title;
        let submissionOptions: { label: string, value: SubmissionStatus }[] = suggestionStatuses;

        switch (submissionType) {
            case "Bug Report": {
                submissionOptions = bugStatuses;
                break;
            }
            case "Player Report": {
                submissionOptions = playerReportStatuses;
                break;
            }
        }

        const statusOptions = new StringSelectMenuBuilder()
            .setCustomId(`set-status-${interaction.message.id}`)
            .setPlaceholder("Select the new submission status...")
            .setOptions(submissionOptions);

        const setReasonButton = new ButtonBuilder()
            .setCustomId(`set-reason-${interaction.message.id}`)
            .setEmoji(Properties.emojis.edit)
            .setLabel("Set Reason")
            .setStyle(ButtonStyle.Secondary);

        const selectMenuActionRow = new ActionRowBuilder().setComponents(statusOptions);
        const buttonActionRow = new ActionRowBuilder().setComponents(setReasonButton);

        await interaction.editReply({
            content: "Use the selection menu below to choose a new status:",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            components: [selectMenuActionRow.toJSON(), buttonActionRow.toJSON()]
        });
        return;
    }
}