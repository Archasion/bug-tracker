import {
    ApplicationCommandDataResolvable,
    Collection,
    GuildMember,
    ChatInputCommandInteraction,
    Client
} from "discord.js";

import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {readdir} from "node:fs/promises";
import {join} from "node:path";

import ClientManager from "../../../Client";
import Command from "./Command";
import clc from "cli-color";

export default class CommandHandler {
    list: Collection<string, Command>;

    constructor() {
        this.list = new Collection();
    }

    public async load() {
        const files = await readdir(join(__dirname, "../../../interactions/commands"));

        for (const file of files) {
            const command = (await import(join(__dirname, "../../../interactions/commands", file))).default;
            await this.register(new command());
        }
    }

    public async register(command: Command) {
        this.list.set(command.name, command);
        console.log(`%s Registered command: "${command.name}"`, clc.blue("(COMMANDS)"));
    }

    public async publish() {
        const commands: ApplicationCommandDataResolvable[] = await Promise.all(
            ClientManager.commands.list.map(command => command.build())
        );

        try {
            await ClientManager.client.application?.commands.set(commands);
            console.log(clc.green(`(COMMANDS) Successfully loaded ${ClientManager.commands.list.size} commands!`));
        } catch (err) {
            console.error(err);
        }
    }

    public async handle(interaction: ChatInputCommandInteraction) {
        const command = this.list.get(interaction.commandName);
        if (!command) return;

        if (command.defer) await interaction.deferReply({ephemeral: true});

        if (!await RestrictionUtils.verifyAccess(command.restriction, interaction.member as GuildMember)) {
            await interaction.editReply({
                content:
                    `You are **below** the required restriction level for this command: \`${RestrictionLevel[command.restriction]}\`\n`
                    + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
            });
            return;
        }

        try {
            await command.execute(interaction);
            console.log(`%s "${command.name}" executed by ${interaction.user.tag} %s`, clc.blue("(COMMANDS)"), clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute command: ${command.name}`);
            console.error(err);
        }
    }
}