import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {Collection, GuildMember, SelectMenuInteraction, Client} from "discord.js";
import {readdir} from "node:fs/promises";
import {join} from "node:path";

import SelectMenu from "./SelectMenu";
import clc from "cli-color";


export default class CommandHandler {
    client: Client;
    list: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, SelectMenu>;

    constructor(client: Client) {
        this.client = client;
        this.list = new Collection();
    }

    public async load() {
        const files = await readdir(join(__dirname, "../../../interactions/select_menus"));

        for (const file of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const select_menu = require(join(__dirname, "../../../interactions/select_menus", file)).default;
            await this.register(new select_menu(this.client));
        }
    }

    public async register(select_menu: SelectMenu) {
        this.list.set(select_menu.name, select_menu);

        const selectMenuName = typeof select_menu.name === "string" ?
            select_menu.name :
            Object.values(select_menu.name)[0];

        console.log(`%s Registered select menu: "${selectMenuName}"`, clc.yellow("(SELECT MENUS)"));
    }

    public async handle(interaction: SelectMenuInteraction) {
        const select_menu = this.list.find(s => {
            if (typeof s.name === "string") return s.name === interaction.customId;

            if ((s.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((s.name as { startsWith: string }).startsWith);
            if ((s.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((s.name as { endsWith: string }).endsWith);
            if ((s.name as { includes: string }).includes) return interaction.customId.includes((s.name as { includes: string }).includes);

            return false;
        });

        if (!select_menu) return;

        const selectMenuName = typeof select_menu.name === "string" ?
            select_menu.name :
            Object.values(select_menu.name)[0];

        if (select_menu.defer) await interaction.deferReply({ephemeral: true});

        if (!await RestrictionUtils.verifyAccess(select_menu.restriction, interaction.member as GuildMember)) {
            await interaction.editReply({
                content:
                    `You are **below** the required restriction level for this select menu: \`${RestrictionLevel[select_menu.restriction]}\`\n`
                    + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
            });
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await select_menu.execute(interaction, this.client);
            console.log(`%s "${selectMenuName}" executed by ${interaction.user.tag} %s`, clc.yellow("(SELECT MENUS)"), clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute select menu: ${selectMenuName}`);
            console.error(err);
        }
    }
}