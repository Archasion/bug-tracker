import Modal from "../../modules/interactions/modals/Modal";
import Guild from "../../db/models/Guild.model";
import Properties from "../../data/Properties";
import Bot from "../../Bot";
import clc from "cli-color";

import {
    ModalSubmitInteraction,
    EmbedBuilder,
    TextChannel,
    NewsChannel
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class AnnounceModal extends Modal {
    constructor(client: Bot) {
        super(client, {
            name: "bot-announcement",
            restriction: RestrictionLevel.Developer
        });
    }

    /**
     * @param  {ModalSubmitInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ModalSubmitInteraction): Promise<void> {
        const title = interaction.fields.getTextInputValue("title");
        const description = interaction.fields.getTextInputValue("description");

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setAuthor({
                name: `Published by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

        const guildConfig = await Guild.find(
            {["channels.bot_updates"]: {$ne: null}},
            {["channels.bot_updates"]: 1, _id: 0}
        );

        guildConfig.forEach(guild => {
            const channel = this.client.channels.cache.get(guild.channels.bot_updates) as TextChannel | NewsChannel;
            if (!channel) return;

            channel.send({embeds: [embed]})
                .then(() => console.log(clc.green(`Published announcement to ${channel.guild.name}`)))
                .catch(() => console.log(clc.blackBright(`Unable to send messages in "${channel.guild.name}"`)));
        });

        await interaction.editReply(`Trying to publish the announcement to **${guildConfig.length}** guilds...`);

        return;
    }
}