import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Bot from "../../Bot";

import {
    MessageActionRowComponentData,
    ChatInputCommandInteraction,
    StringSelectMenuBuilder,
    ApplicationCommandType,
    ActionRowBuilder,
    ActionRowData
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
            {
                ["channels.playerReports"]: 1,
                ["channels.suggestions"]: 1,
                ["channels.bugReports"]: 1,
                _id: 0
            }
        );

        const submissionTypeOptions = [];

        if (guild?.channels.bugReports) {
            submissionTypeOptions.push({
                label: "Bug Report",
                value: "bug-report"
            });
        }

        if (guild?.channels.playerReports) {
            submissionTypeOptions.push({
                label: "Player Report",
                value: "player-report"
            });
        }

        if (guild?.channels.suggestions) {
            submissionTypeOptions.push({
                label: "Suggestion",
                value: "suggestion"
            });
        }

        if (submissionTypeOptions.length === 0) {
            await interaction.editReply("There are no submission channels set up.");
            return;
        }

        const submissionTypeSelection = new StringSelectMenuBuilder()
            .setCustomId("submission-type")
            .setPlaceholder("Select the submission type...")
            .setOptions(...submissionTypeOptions);

        const actionRow = new ActionRowBuilder()
            .setComponents(submissionTypeSelection)
            .toJSON() as ActionRowData<MessageActionRowComponentData>

        await interaction.editReply({
            content: "Please select the submission type:",
            components: [actionRow]
        });
        return;
    }
}