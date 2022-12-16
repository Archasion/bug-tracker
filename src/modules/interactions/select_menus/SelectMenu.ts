import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {SelectMenuInteraction} from "discord.js";

export default abstract class SelectMenu {
    restriction: RestrictionLevel;
    defer: boolean;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    abstract execute(interaction: SelectMenuInteraction): Promise<void>;

    protected constructor(data: { restriction: RestrictionLevel; defer: boolean; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.restriction = data.restriction;
        this.defer = data.defer;
        this.name = data.name;
    }
}