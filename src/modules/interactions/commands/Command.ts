import {ApplicationCommandOptionData, ChatInputApplicationCommandData, ChatInputCommandInteraction} from "discord.js";
import {RestrictionLevel} from "../../../utils/RestrictionUtils";

type CustomApplicationCommandData = ChatInputApplicationCommandData & {
    restriction: RestrictionLevel;
    defer: boolean;
}

export default abstract class Command {
    restriction: RestrictionLevel;
    defer: boolean;
    name: string;
    description: string;
    options: ApplicationCommandOptionData[];

    abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;

    protected constructor(data: CustomApplicationCommandData) {
        this.restriction = data.restriction;
        this.defer = data.defer;
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