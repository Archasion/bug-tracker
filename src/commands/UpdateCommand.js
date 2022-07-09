const Command = require("../modules/commands/command");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = class UpdateCommand extends Command {
	constructor(client) {
		super(client, {
			name: "update",
			description: "View the most recent changes",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const update = new EmbedBuilder()

			.setColor(config.colors.default)
			.setTitle("Recent Update(s)")
			.setDescription(
				// eslint-disable-next-line quotes
				'- Replaced all commands with slash commands (use `/help` for more info)\n- Purged moderation commands and most "other" commands\n- Used the latest API and technology (e.g. buttons, modals, slash commands, etc)\n- Implemented report/suggestion editing\n- Replaced message ID arguments for reports/suggestions with custom IDs based on the amount (e.g. 1, 2, 3, etc)\n- Added the ability to configure report/suggestion channel\n- Restricted certain commands to roles/permissions (can be configured using `/role`)\n- Added a way to wipe stored data'
			)
			.setFields([
				{
					name: "Last Updated",
					value: "<t:1650808697:R>"
				}
			]);

		const githubButton = new ButtonBuilder({})

			.setLabel("GitHub Repository")
			.setStyle(ButtonStyle.Link)
			.setURL("https://github.com/Archasion/bug-tracker");

		const authoriseButton = new ButtonBuilder({})

			.setLabel("Grant Slash Commands")
			.setStyle(ButtonStyle.Link)
			.setURL(
				"https://discord.com/api/oauth2/authorize?client_id=710407168200802384&scope=applications.commands"
			);

		const actionRow = new ActionRowBuilder().addComponents([githubButton, authoriseButton]);

		interaction.editReply({
			embeds: [update],
			components: [actionRow],
			ephemeral: true
		});
	}
};
