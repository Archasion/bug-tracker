import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Client} from "discord.js";

export default class SelectMenu {
    client: Client;
    restriction: RestrictionLevel;
    defer?: boolean;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    constructor(client: Client, data: { restriction: RestrictionLevel; defer?: boolean; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.client = client;
        this.restriction = data.restriction;
        this.defer = data.defer ?? false;
        this.name = data.name;
    }
}