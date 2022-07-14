const Command = require("../modules/commands/command");
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = class AnnounceCommand extends Command {
	constructor(client) {
		super(client, {
			name: "announce",
			description: "Notify servers regarding certain updates",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			has_modal: true,
			permissions: [],
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const title = new TextInputBuilder()

			.setCustomId("title")
			.setLabel("Annnouncement Header")
			.setRequired(true)
			.setValue("")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Announcement header...");

		const description = new TextInputBuilder()

			.setCustomId("description")
			.setLabel("Annnouncement Description")
			.setRequired(true)
			.setValue("")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("Announcement description...");

		const titleActionRow = new ActionRowBuilder().addComponents([title]);
		const descriptionActionRow = new ActionRowBuilder().addComponents([description]);

		const form = new ModalBuilder()
			.setCustomId("bot-update-announcement")
			.setTitle("Bot Update Annnouncement")
			.addComponents([titleActionRow, descriptionActionRow]);

		await interaction.showModal(form);
	}
};
