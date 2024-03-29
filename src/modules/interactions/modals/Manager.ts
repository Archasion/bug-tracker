import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Collection, GuildMember, ModalSubmitInteraction} from "discord.js";
import {readdir} from "node:fs/promises";
import {join} from "node:path";

import Modal from "./Modal";
import clc from "cli-color";


export default class ModalHandler {
    list: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, Modal>;

    constructor() {
        this.list = new Collection();
    }

    public async load() {
        const files = await readdir(join(__dirname, "../../../interactions/modals"));

        for (const file of files) {
            const modal = (await import(join(__dirname, "../../../interactions/modals", file))).default;
            await this.register(new modal());
        }
    }

    public async register(modal: Modal) {
        this.list.set(modal.name, modal);

        const modalName = typeof modal.name === "string" ?
            modal.name :
            Object.values(modal.name)[0];

        console.log(`%s Registered modal: "${modalName}"`, clc.red("(MODALS)"));
    }

    public async handle(interaction: ModalSubmitInteraction) {
        const modal = this.list.find(m => {
            if (typeof m.name === "string") return m.name === interaction.customId;

            if ((m.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((m.name as { startsWith: string }).startsWith);
            if ((m.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((m.name as { endsWith: string }).endsWith);
            if ((m.name as { includes: string }).includes) return interaction.customId.includes((m.name as { includes: string }).includes);

            return false;
        });

        if (!modal) return;

        const modalName = typeof modal.name === "string" ?
            modal.name :
            Object.values(modal.name)[0];

        await interaction.deferReply({ephemeral: true});

        if (!await RestrictionUtils.verifyAccess(modal.restriction, interaction.member as GuildMember)) {
            await interaction.editReply({
                content:
                    `You are **below** the required restriction level for this modal: \`${RestrictionLevel[modal.restriction]}\`\n`
                    + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
            });
            return;
        }

        try {
            await modal.execute(interaction);
            console.log(`%s "${modalName}" executed by ${interaction.user.tag} %s`, clc.red("(MODALS)"), clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute modal: ${modal.name}`);
            console.error(err);
        }
    }
}