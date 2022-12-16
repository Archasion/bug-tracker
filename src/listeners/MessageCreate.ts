import EventListener from "../modules/listeners/Listener";
import RestrictionUtils from "../utils/RestrictionUtils";
import ValidationUtils from "../utils/ValidationUtils";
import Guild from "../database/models/Guild.model";
import Properties from "../data/Properties";
import ClientManager from "../Client";

import {Message, EmbedBuilder} from "discord.js";

export default class MessageCreateEventListener extends EventListener {
    constructor() {
        super({
            name: "messageCreate",
            once: false
        });
    }

    public async execute(message: Message) {
        if (!message.guild) return;

        const guild = await Guild.findOne(
            {_id: message.guildId},
            {["settings.autoDelete"]: 1, _id: 0}
        );

        const autoDeleteChannels = guild?.settings.autoDelete;
        if (autoDeleteChannels?.includes(message.channelId) && !message.author.bot) await message.delete();

        if (
            RestrictionUtils.isDeveloper(message.author.id) &&
            ValidationUtils.isContactChannel(message.channel.id) &&
            message.reference // Message is a reply
        ) {
            const reference = await message.channel.messages.fetch(message.reference.messageId as string);
            if (!reference) return;

            const [referenceEmbed] = reference.embeds;

            const referenceAuthorId = referenceEmbed.footer?.text?.match(/ID: (\d{17,19})/)?.[1];
            const referenceAuthor = await ClientManager.client.users.fetch(referenceAuthorId as string);

            const newEmbed = new EmbedBuilder(referenceEmbed.toJSON());

            newEmbed.setTitle(`Your ${referenceEmbed.data.title}`);
            newEmbed.setTimestamp();

            const response = new EmbedBuilder()

                .setColor(Properties.colors.default)
                .setTitle("Developer Response")
                .setDescription(message.content);

            try {
                await referenceAuthor?.send({embeds: [response, referenceEmbed]});

                reference?.delete();
                await message.delete();
            } catch {
                await message.react("❌");
            }
        }
    }
};