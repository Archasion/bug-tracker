import {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {ModalSubmitInteraction} from "discord.js";

export default abstract class Modal {
    restriction: RestrictionLevel;
    name: string | { startsWith: string } | { endsWith: string } | { includes: string };

    abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

    protected constructor(data: { restriction: RestrictionLevel; name: string | { startsWith: string; } | { endsWith: string; } | { includes: string; } }) {
        this.restriction = data.restriction;
        this.name = data.name;
    }
}