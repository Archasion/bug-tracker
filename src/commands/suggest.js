const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

module.exports = class SuggestCommand extends Command {
	constructor(client) {
		super(client, {
			name: "suggest",
			description: "Create a new suggestion",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			has_modal: true,
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const submissionChannel = interaction.guild.channels.cache.get(
			settings.channels.suggestions
		);

		if (!submissionChannel) {
			interaction.reply({
				content: "There is no channel set for **suggestions**.\nPlease set one using `/channel set suggestions <channel>`",
				ephemeral: true
			});
			return;
		}

		const generalPermissions = [
			"SendMessages",
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks",
			"AddReactions",
			"UseExternalEmojis",
			"CreatePublicThreads",
			"ManageThreads"
		];

		// prettier-ignore
		if (await insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;

		const suggestion = new TextInputBuilder()

			.setCustomId("suggestion")
			.setLabel("Suggestion")
			.setMinLength(6)
			.setMaxLength(1024)
			.setPlaceholder("Please enter your suggestion...")
			.setRequired(true)
			.setValue("")
			.setStyle(TextInputStyle.Paragraph);

		const form = new ModalBuilder().setCustomId("suggestion").setTitle("Suggestion");
		const actionRow = new ActionRowBuilder().addComponents([suggestion]);

		form.addComponents([actionRow]);
		await interaction.showModal(form);
	}
};
