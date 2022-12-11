import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Client} from "discord.js";

export default class Modal {
    client: Client;
    restriction: RestrictionLevel;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    constructor(client: Client, data: { restriction: RestrictionLevel; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.client = client;
        this.restriction = data.restriction;
        this.name = data.name;
    }
}