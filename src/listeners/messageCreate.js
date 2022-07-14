const EventListener = require("../modules/listeners/listener");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "messageCreate" });
	}

	async execute(message) {
		const settings = await Guilds.findOne({ id: message.guild.id });
		if (settings.auto.delete.includes(message.channel.id) && !message.author.bot)
			message.delete();

		if (
			(await ValidationUtils.isSupportChannel(message.channel.id)) &&
			(await ValidationUtils.isDeveloper(message.author.id)) &&
			message.reference // Message is a reply
		) {
			const reference = message.channel.messages.cache.get(message.reference.messageId);

			if (
				message.mentions.repliedUser.id !== this.client.user.id ||
				reference.embeds.length === 0
			)
				return;

			const referenceEmbed = reference.embeds[0];
			const referenceAuthorId = referenceEmbed.data.footer.text.match(/ID: (\d{17,19})/)[1];
			const referenceAuthor = this.client.users.cache.get(referenceAuthorId);

			referenceEmbed.data.title = `Your ${referenceEmbed.data.title}`;
			referenceEmbed.data.timestamp = new Date();

			const response = new EmbedBuilder()

				.setColor(config.colors.default)
				.setTitle("Developer Response")
				.setDescription(message.content);

			try {
				await referenceAuthor.send({ embeds: [response, referenceEmbed] });

				reference.delete();
				message.delete();
			} catch {
				message.react("❌");
			}
		}
	}
};
