import EventListener from "../modules/listeners/Listener";
import ClientManager from "../Client";

import {Interaction} from "discord.js";

export default class InteractionCreateEventListener extends EventListener {
    constructor() {
        super({
            name: "interactionCreate",
            once: false
        });
    }

    public async execute(interaction: Interaction) {
        if (interaction.isChatInputCommand()) await ClientManager.commands.handle(interaction);
        if (interaction.isButton()) await ClientManager.buttons.handle(interaction);
        if (interaction.isStringSelectMenu()) await ClientManager.selectMenus.handle(interaction);
        if (interaction.isModalSubmit()) await ClientManager.modals.handle(interaction);
    }
};