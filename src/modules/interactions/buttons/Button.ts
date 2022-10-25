import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import Bot from "../../../Bot";

export default class Button {
    client: Bot;
    restriction: RestrictionLevel;
    defer?: boolean;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    constructor(client: Bot, data: { restriction: RestrictionLevel; defer?: boolean; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.client = client;
        this.restriction = data.restriction;
        this.defer = data.defer ?? false;
        this.name = data.name;

        try {
            // noinspection JSIgnoredPromiseFromCall
            this.client.buttons.register(this);
        } catch (err) {
            console.error(err);
            return;
        }
    }
}