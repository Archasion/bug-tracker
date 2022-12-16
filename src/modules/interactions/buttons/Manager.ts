import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Collection, GuildMember, ButtonInteraction} from "discord.js";
import {readdir} from "node:fs/promises";
import {join} from "node:path";

import Button from "./Button";
import clc from "cli-color";


export default class ButtonHandler {
    list: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, Button>;

    constructor() {
        this.list = new Collection();
    }

    public async load() {
        const files = await readdir(join(__dirname, "../../../interactions/buttons"));

        for (const file of files) {
            const button = (await import(join(__dirname, "../../../interactions/buttons", file))).default;
            await this.register(new button());
        }
    }

    public async register(button: Button) {
        this.list.set(button.name, button);

        const buttonName = typeof button.name === "string" ?
            button.name :
            Object.values(button.name)[0];

        console.log(`%s Registered button: "${buttonName}"`, clc.magenta("(BUTTONS)"));
    }

    public async handle(interaction: ButtonInteraction) {
        const button = this.list.find(b => {
            if (typeof b.name === "string") return b.name === interaction.customId;

            if ((b.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((b.name as { startsWith: string }).startsWith);
            if ((b.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((b.name as { endsWith: string }).endsWith);
            if ((b.name as { includes: string }).includes) return interaction.customId.includes((b.name as { includes: string }).includes);

            return false;
        });

        if (!button) return;

        const buttonName = typeof button.name === "string" ?
            button.name :
            Object.values(button.name)[0];

        if (button.defer) await interaction.deferReply({ephemeral: true});

        if (!await RestrictionUtils.verifyAccess(button.restriction, interaction.member as GuildMember)) {
            await interaction.editReply({
                content:
                    `You are **below** the required restriction level for this button: \`${RestrictionLevel[button.restriction]}\`\n`
                    + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
            });
            return;
        }

        try {
            await button.execute(interaction);
            console.log(`%s "${buttonName}" executed by ${interaction.user.tag} %s`, clc.magenta("(BUTTONS)"), clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute button: ${buttonName}`);
            console.error(err);
        }
    }
}