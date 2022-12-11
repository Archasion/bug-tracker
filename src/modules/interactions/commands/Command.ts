import {ApplicationCommandOptionData, ChatInputApplicationCommandData} from "discord.js";
import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Client} from "discord.js";

type CustomApplicationCommandData = ChatInputApplicationCommandData & {
    restriction: RestrictionLevel;
    defer?: boolean;
}

export default class Command {
    client: Client;
    restriction: RestrictionLevel;
    defer: boolean;
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];

    constructor(client: Client, data: CustomApplicationCommandData) {
        this.client = client;
        this.restriction = data.restriction;
        this.defer = data.defer ?? false;
        this.name = data.name;
        this.description = data.description;
        this.options = data.options ?? [];
    }

    build(): ChatInputApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: this.options ?? [],
        };
    }
}