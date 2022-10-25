import {Collection, GuildMember, ButtonInteraction} from "discord.js";
import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";

import Properties from "../../../data/Properties";
import Button from "./Button";
import Bot from "../../../Bot";
import clc from "cli-color";

import {readdirSync} from "fs";
import {join} from "path";

export default class CommandHandler {
    client: Bot;
    buttons: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, Button>;

    constructor(client: Bot) {
        this.client = client;
        this.buttons = new Collection();
    }

    public async load() {
        const files = readdirSync(join(__dirname, "../../../interactions/buttons"))
            .filter(file => file.endsWith(".js"));

        for (const file of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const button = require(join(__dirname, "../../../interactions/buttons", file)).default;
            new button(this.client);
        }
    }

    public async register(button: Button) {
        this.buttons.set(button.name, button);

        const buttonName = typeof button.name === "string" ?
            button.name :
            Object.values(button.name)[0];

        console.log(`%s Registered button: "${buttonName}"`, Properties.cli.modules.buttons);
    }

    public async handle(interaction: ButtonInteraction) {
        const button = this.buttons.find(b => {
            if (typeof b.name === "string") return b.name === interaction.customId;

            if ((b.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((b.name as { startsWith: string }).startsWith);
            if ((b.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((b.name as { endsWith: string }).endsWith);
            if ((b.name as { includes: string }).includes) return interaction.customId.includes((b.name as { includes: string }).includes);

            return false;
        });

        if (!button) {
            return;
        }

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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await button.execute(interaction, this.client);
            console.log(`%s "${buttonName}" executed by ${interaction.user.tag} %s`, Properties.cli.modules.buttons, clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute button: ${buttonName}`);
            console.error(err);
        }
    }
}