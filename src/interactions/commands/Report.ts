import Command from "../../modules/interactions/commands/Command";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class ReportCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "report",
            description: "DEPRECATED",
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
        await interaction.editReply("This command has been deprecated, please use `/submit` instead.");
        return;
    }
}