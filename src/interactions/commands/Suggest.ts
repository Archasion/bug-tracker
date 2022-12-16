import Command from "../../modules/interactions/commands/Command";

import {ChatInputCommandInteraction, ApplicationCommandType} from "discord.js";
import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class SuggestCommand extends Command {
    constructor() {
        super({
            name: "suggest",
            description: "`DEPRECATED`",
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