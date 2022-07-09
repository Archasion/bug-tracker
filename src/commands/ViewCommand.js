const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class ViewCommand extends Command {
	constructor(client) {
		super(client, {
			name: "view",
			description: "View a submitted report/suggestion",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "id",
					description: "The ID of the report/suggestion",
					type: Command.option_types.STRING,
					required: true
				},
				{
					name: "type",
					description: "The type of the report/suggestion",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bug Report",
							value: "bugs"
						},
						{
							name: "Player Report",
							value: "reports"
						},
						{
							name: "Suggestion",
							value: "suggestions"
						}
					]
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const type = interaction.options.getString("type");
		const id = interaction.options.getString("id");

		const settings = await Guilds.findOne({ id: interaction.guildId });

		let report;
		for (const item of settings[type]) {
			// eslint-disable-next-line eqeqeq
			if (item.number == id) report = item;
		}

		if (!report) {
			interaction.editReply({
				content: `There are no **${type}** with the ID of \`${id}\``,
				ephemeral: true
			});
			return;
		}

		const author = await interaction.guild.members.fetch(report.author);
		const embed = new EmbedBuilder()

			.setColor(config.colors.default)
			.setThumbnail(author.displayAvatarURL({ dynamic: true }))
			.setFooter({ text: `#${id}` });

		switch (type) {
			case "bugs":
				embed.setAuthor({ name: `Priority: ${report.priority}` });
				embed.setFields([
					{
						name: "Summary",
						value: report.summary
					},
					{
						name: "Description",
						value: report.description
					},
					{
						name: "System Specs",
						value: report.specs
					}
				]);
				break;

			case "reports":
				embed.setFields([
					{
						name: "Reported Player",
						value: report.player
					},
					{
						name: "Reason",
						value: report.reason
					}
				]);
				break;

			case "suggestions":
				embed.setFields([
					{
						name: "Suggestion",
						value: report.suggestion
					}
				]);
				break;
		}

		interaction.editReply({
			content: `${author} (\`${author.id}\`)`,
			embeds: [embed],
			ephemeral: true
		});
	}
};
