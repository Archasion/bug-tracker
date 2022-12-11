import EventListener from "../modules/listeners/Listener";

import {ButtonManager, CommandManager, ModalManager, SelectMenuManager} from "../Client";
import {Interaction, Client} from "discord.js";

module.exports = class InteractionCreateEventListener extends EventListener {
    constructor(client: Client) {
        super(client, {name: "interactionCreate"});
    }

    public async execute(interaction: Interaction) {
        if (interaction.isChatInputCommand()) await CommandManager.handle(interaction);
        if (interaction.isButton()) await ButtonManager.handle(interaction);
        if (interaction.isStringSelectMenu()) await SelectMenuManager.handle(interaction);
        if (interaction.isModalSubmit()) await ModalManager.handle(interaction);
    }
};