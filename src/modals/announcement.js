const Modal = require("../modules/modals/modal");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class AnnouncementModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: "bot-update-announcement",
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const title = interaction.fields.getTextInputValue("title");
		const description = interaction.fields.getTextInputValue("description");

		const announcement = new EmbedBuilder()

			.setColor(config.colors.default)
			.setTitle(title)
			.setDescription(description)
			.setTimestamp();

		const publishingGuilds = await Guilds.find({
			"channels.bot_updates": { $ne: null }
		});

		interaction.reply({
			content: "Publishing message to guilds...",
			ephemeral: true
		});

		for (const item of publishingGuilds) {
			const announcementChannel = this.client.channels.cache.get(item.channels.bot_updates);

			if (announcementChannel) {
				announcementChannel.send({
					embeds: [announcement]
				});
				log.info(
					`Published bot update to "${announcementChannel.guild.name}" (${announcementChannel.guild.id})`
				);
			}
		}
	}
};
