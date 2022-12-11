import Button from "../../modules/interactions/buttons/Button";

import {RestrictionLevel} from "../../utils/RestrictionUtils";
import {ButtonInteraction, Client} from "discord.js";

export default class RejectButton extends Button {
    constructor(client: Client) {
        super(client, {
            name: "reject",
            restriction: RestrictionLevel.Reviewer,
            defer: true
        });
    }

    /**
     * @param {ButtonInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ButtonInteraction): Promise<void> {
        await interaction.editReply("No longer supported, please use the new \"Set Status\" button on future reports");
        return;
    }
}