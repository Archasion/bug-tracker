import ModalHandler from "./Manager";
import Bot from "../../../Bot";

import {RestrictionLevel} from "../../../utils/RestrictionUtils";

export default class Modal {
    client: Bot;
    manager: ModalHandler;
    restriction: RestrictionLevel;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    constructor(client: Bot, data: { restriction: RestrictionLevel; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.client = client;
        this.manager = client.modals;
        this.restriction = data.restriction;
        this.name = data.name;

        try {
            // noinspection JSIgnoredPromiseFromCall
            this.client.modals.register(this);
        } catch (err) {
            console.error(err);
            return;
        }
    }
}