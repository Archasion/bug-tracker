const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

module.exports = class ReportCommand extends Command {
	constructor(client) {
		super(client, {
			name: "report",
			description: "Create a new bug or player report.",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			has_modal: true,
			options: [
				{
					name: "bug",
					description: "Report a bug.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "priority",
							description: "How important is the report?",
							type: Command.option_types.STRING,
							required: false,
							choices: [
								{
									name: "High",
									value: "-high"
								},
								{
									name: "Medium",
									value: "-medium"
								},
								{
									name: "Low",
									value: "-low"
								}
							]
						}
					]
				},
				{
					name: "player",
					description: "Report a player.",
					type: Command.option_types.SUB_COMMAND
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const type = interaction.options.getSubcommand();

		let form;
		let submissionChannel;
		const components = [];
		const actionRows = [];

		if (type === "bug") {
			const priority = interaction.options.getString("priority") ?? "-none";

			const summary = new TextInputBuilder()

				.setCustomId("summary")
				.setLabel("Summary of the Bug")
				.setMinLength(6)
				.setMaxLength(50)
				.setPlaceholder("Please provide a summary of the encountered bug...")
				.setRequired(true)
				.setValue("")
				.setStyle(TextInputStyle.Short);

			const description = new TextInputBuilder()

				.setCustomId("description")
				.setLabel("Description of the Bug")
				.setMinLength(6)
				.setMaxLength(1024)
				.setPlaceholder("Please provide a detailed description of the bug...")
				.setRequired(true)
				.setValue("")
				.setStyle(TextInputStyle.Paragraph);

			const specs = new TextInputBuilder()

				.setCustomId("specs")
				.setLabel("System Specs")
				.setMinLength(6)
				.setMaxLength(1024)
				.setPlaceholder("(optional) Please enter your system specs...")
				.setRequired(false)
				.setValue("")
				.setStyle(TextInputStyle.Paragraph);

			if (settings.channels.bugs) {
				submissionChannel = interaction.guild.channels.cache.get(settings.channels.bugs);
			}

			components.push(summary, description, specs);
			form = new ModalBuilder().setCustomId(`report-bug${priority}`).setTitle("Bug Report");
		}

		if (type === "player") {
			const summary = new TextInputBuilder()

				.setCustomId("player")
				.setLabel("Player Name")
				.setMinLength(6)
				.setMaxLength(50)
				.setPlaceholder("E.g. John Doe")
				.setRequired(true)
				.setValue("")
				.setStyle(TextInputStyle.Short);

			const reason = new TextInputBuilder()

				.setCustomId("reason")
				.setLabel("Reason")
				.setMinLength(6)
				.setMaxLength(1024)
				.setPlaceholder("Please provide a detailed reason behind the report...")
				.setRequired(true)
				.setValue("")
				.setStyle(TextInputStyle.Paragraph);

			// prettier-ignore
			if (settings.channels.reports) {
				submissionChannel = interaction.guild.channels.cache.get(
					settings.channels.reports
				);
			}

			components.push(summary, reason);
			form = new ModalBuilder().setCustomId("report-player").setTitle("Player Report");
		}

		if (!submissionChannel) {
			interaction.reply({
				content: `There is no channel set for **${type}** reports.\nPlease set one using \`/channel set ${type} reports <channel>\``,
				ephemeral: true
			});
			return;
		}

		const generalPermissions = [
			"SendMessages",
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks"
		];

		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions, submissionChannel)) return;

		if (type === "bug") {
			const bugPermissions = [
				"AddReactions",
				"UseExternalEmojis",
				"CreatePublicThreads",
				"ManageThreads"
			];

			// prettier-ignore
			if (await insufficientPermissions(this.client.user.id, interaction, bugPermissions, submissionChannel)) return;
		}

		components.forEach(component => {
			const actionRow = new ActionRowBuilder().addComponents([component]);
			actionRows.push(actionRow);
		});

		form.addComponents(actionRows);
		await interaction.showModal(form);
	}
};
