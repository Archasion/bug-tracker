import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    MessageActionRowComponentData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ApplicationCommand,
    ActionRowBuilder,
    ActionRowData,
    ButtonBuilder,
    EmbedBuilder,
    GuildMember,
    ButtonStyle
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
        const fetchedCommands = await this.client.application?.commands.fetch();

        const allowedCommands = this.manager.commands.filter(command => command.restriction <= restrictionLevel).map(command => {
            return {
                name: command.name,
                description: command.description,
                restriction: command.restriction,
                options: command.options
            }
        });

        const usableCommands = allowedCommands.flatMap(command => {
            const fetchedCommand = fetchedCommands?.find(fetchedCommandData => command.name === fetchedCommandData.name) as ApplicationCommand;
            const commands = []

            for (const subcommand of fetchedCommand.options) {
                if (subcommand.type !== ApplicationCommandOptionType.Subcommand) continue;

                commands.push({
                    restriction: command.restriction,
                    description: subcommand.description,
                    id: fetchedCommand.id,
                    name: `${command.name} ${subcommand.name}`
                });
            }

            if (commands.length === 0) {
                commands.push({
                    restriction: command.restriction,
                    description: command.description,
                    id: fetchedCommand.id,
                    name: command.name
                });
            }

            return commands;
        }).values();

        const commandList = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Command Guide")
            .setDescription("**Public Commands**\n\n")
            .setFields([]);

        for (let i = 1; i <= restrictionLevel; i++) {
            commandList.data.fields?.push({
                name: `${RestrictionLevel[i]} Commands`,
                value: "\u200b"
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const command of usableCommands) {
            if (command.restriction === RestrictionLevel.Public) {
                commandList.data.description += `</${command.name}:${command.id}> **·** ${command.description}\n`;
                continue;
            }

            commandList.data.fields![command.restriction - 1].value += `</${command.name}:${command.id}> **·** ${command.description}\n`;
        }

        commandList.data.fields = commandList.data.fields?.filter(field => field.value !== "\u200b");
        const scopes = ["bot", "applications.commands"].join("%20");

        const inviteUrl = new ButtonBuilder()
            .setLabel("Invite")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=${scopes}&permissions=${Properties.invitePermissions}`);

        const supportServer = new ButtonBuilder()
            .setLabel("Support")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/bTR5qBG");

        const actionRow = new ActionRowBuilder()
            .setComponents(inviteUrl, supportServer)
            .toJSON() as ActionRowData<MessageActionRowComponentData>

        await interaction.editReply({
            embeds: [commandList],
            components: [actionRow]
        });
        return;
    }
}