import {
    ApplicationCommandDataResolvable,
    Collection,
    GuildMember,
    ChatInputCommandInteraction,
    Client
} from "discord.js";
import RestrictionUtils, {RestrictionLevel} from "../../../utils/RestrictionUtils";
import {CommandManager} from "../../../Client";
import {readdir} from "node:fs/promises";
import {join} from "node:path";

import Command from "./Command";
import clc from "cli-color";

export default class CommandHandler {
    client: Client;
    list: Collection<string, Command>;

    constructor(client: Client) {
        this.client = client;
        this.list = new Collection();
    }

    public async load() {
        const files = await readdir(join(__dirname, "../../../interactions/commands"));

        for (const file of files) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command = require(join(__dirname, "../../../interactions/commands", file)).default;
            await this.register(new command(this.client));
        }
    }

    public async register(command: Command) {
        this.list.set(command.name, command);
        console.log(`%s Registered command: "${command.name}"`, clc.blue("(COMMANDS)"));
    }

    public async publish() {
        const commands: ApplicationCommandDataResolvable[] = await Promise.all(
            CommandManager.list.map(command => command.build())
        );

        try {
            await this.client.application?.commands.set(commands);
            console.log(clc.green(`(COMMANDS) Successfully loaded ${CommandManager.list.size} commands!`));
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await command.execute(interaction, this.client);
            console.log(`%s "${command.name}" executed by ${interaction.user.tag} %s`, clc.blue("(COMMANDS)"), clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
        } catch (err) {
            console.log(`Failed to execute command: ${command.name}`);
            console.error(err);
        }
    }
}