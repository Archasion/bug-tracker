import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    GuildMember
} from "discord.js";

import RestrictionUtils, {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class HelpCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "help",
            description: "List all commands available to you.",
            restriction: RestrictionLevel.Public,
            type: ApplicationCommandType.ChatInput,
            defer: true
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const restrictionLevel = await RestrictionUtils.getRestrictionLevel(interaction.member as GuildMember);
        const usableCommands = this.manager.commands.filter(command => command.restriction <= restrictionLevel);

        const commandList = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Command Guide")
            .setFields([]);

        for (let i = 0; i <= restrictionLevel; i++) {
            commandList.data.fields?.push({
                name: `${RestrictionLevel[i]} Commands`,
                value: "\u200b"
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        usableCommands.map(command => commandList.data.fields![command.restriction].value += `**\`/${command.name}\` ·** ${command.description}\n`);
        commandList.data.fields = commandList.data.fields?.filter(field => field.value !== "\u200b");

        await interaction.editReply({ embeds: [commandList] });
        return;
    }
}