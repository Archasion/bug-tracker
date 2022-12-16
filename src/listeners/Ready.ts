import EventListener from "../modules/listeners/Listener";
import ClientManager from "../Client";
import clc from "cli-color";

export default class ReadyEventListener extends EventListener {
    constructor() {
        super({
            name: "ready",
            once: true
        });
    }

    public async execute() {
        console.log("%s %s is online!", clc.green("(READY)"), ClientManager.client.user?.tag);

        await ClientManager.selectMenus.load();
        await ClientManager.buttons.load();
        await ClientManager.modals.load();

        await ClientManager.commands.load();
        await ClientManager.commands.publish();
    }
};