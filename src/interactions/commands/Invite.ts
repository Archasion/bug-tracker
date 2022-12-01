import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import {
    ChatInputCommandInteraction,
    ApplicationCommandType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class InviteCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "invite",
            description: "Invite the bot to your server!",
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
            .setAuthor({name: "Invite", iconURL: this.client.user?.displayAvatarURL()})
            .setDescription("Want to invite this bot to your server or a server you manage? Click the button below!");

        const scopes = ["bot", "applications.commands"].join("%20");

        const inviteUrl = new ButtonBuilder()
            .setLabel("Invite")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=${scopes}&permissions=${Properties.invitePermissions}`);

        const actionRow = new ActionRowBuilder().setComponents(inviteUrl);

        await interaction.editReply({
            embeds: [embed],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            components: [actionRow]
        });
        return;
    }
}