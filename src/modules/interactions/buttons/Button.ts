import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {ButtonInteraction} from "discord.js";

export default abstract class Button {
    restriction: RestrictionLevel;
    defer: boolean;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    abstract execute(interaction: ButtonInteraction): Promise<void>;

    protected constructor(data: { restriction: RestrictionLevel; defer: boolean; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.restriction = data.restriction;
        this.defer = data.defer ?? false;
        this.name = data.name;
    }
}