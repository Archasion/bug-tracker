import EventListener from "../modules/listeners/Listener";
import clc from "cli-color";
import Bot from "../Bot";

module.exports = class ReadyEventListener extends EventListener {
    constructor(client: Bot) {
        super(client, {
            name: "ready",
            once: true
        });
    }

    public async execute(client: Bot) {
        console.log("%s %s is online!", clc.green("(READY)"), client.user?.tag);

        await client.select_menus.load();
        await client.buttons.load();
        await client.modals.load();

        await client.commands.load();
        await client.commands.publish();
    }
};