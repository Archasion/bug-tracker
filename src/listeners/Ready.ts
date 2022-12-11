import EventListener from "../modules/listeners/Listener";
import clc from "cli-color";

import {CommandManager, SelectMenuManager, ButtonManager, ModalManager} from "../Client";
import {Client} from "discord.js";

module.exports = class ReadyEventListener extends EventListener {
    constructor(client: Client) {
        super(client, {
            name: "ready",
            once: true
        });
    }

    public async execute(client: Client) {
        console.log("%s %s is online!", clc.green("(READY)"), client.user?.tag);

        await SelectMenuManager.load();
        await ButtonManager.load();
        await ModalManager.load();

        await CommandManager.load();
        await CommandManager.publish();
    }
};