import Command from "../../modules/interactions/commands/Command";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    SelectMenuBuilder,
    ActionRowBuilder
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class SubmitCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "submit",
            description: "Create a submission (bug report, player report or suggestion)",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {channels: 1, _id: 0}
        );

        const submissionOptions = [];

        if (guild?.channels.bugReports) {
            submissionOptions.push({
                label: "Bug Report",
                value: "bug-report"
            });
        }

        if (guild?.channels.playerReports) {
            submissionOptions.push({
                label: "Player Report",
                value: "player-report"
            });
        }

        if (guild?.channels.suggestions) {
            submissionOptions.push({
                label: "Suggestion",
                value: "suggestion"
            });
        }

        if (submissionOptions.length === 0) {
            await interaction.editReply("There are no submission channels set up");
            return;
        }

        const submissionType = new SelectMenuBuilder()
            .setCustomId("submission-type")
            .setPlaceholder("Select the submission type...")
            .setOptions(...submissionOptions);

        const actionRow = new ActionRowBuilder().setComponents(submissionType);

        await interaction.editReply({
            content: "Please select the submission type:",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            components: [actionRow.toJSON()]
        });
        return;
    }
}