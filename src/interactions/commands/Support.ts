import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class SupportCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "support",
            description: "Need help with the bot? Join the support server",
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
        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setAuthor({ name: "Support Server", iconURL: this.client.user?.displayAvatarURL() })
            .setDescription("**Need assistance with the bot?** Join the bot's support server for 1 on 1 communication with the developer, by clicking the button below.");

        const supportServer = new ButtonBuilder()
            .setLabel("Join Support Server")
            .setURL("https://discord.gg/bTR5qBG")
            .setStyle(ButtonStyle.Link);

        const actionRow = new ActionRowBuilder().setComponents(supportServer);

        await interaction.editReply({
            embeds: [embed],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            components: [actionRow]
        });
        return;
    }
}