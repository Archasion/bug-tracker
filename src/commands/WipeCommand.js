const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

module.exports = class WipeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "wipe",
			description: "Wipe certain/all data from the database",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 3,
			permissions: [],
			options: [
				{
					name: "type",
					description: "The data you want to wipe",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bug Reports",
							value: "bug"
						},
						{
							name: "Player Reports",
							value: "report"
						},
						{
							name: "Suggestions",
							value: "suggestion"
						},
						{
							name: "Channel Configuration",
							value: "channel"
						},
						{
							name: "Role Configuration",
							value: "role"
						},
						{
							name: "Automation",
							value: "auto"
						},
						{
							name: "Everything",
							value: "all"
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

		if (type === "bug" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { bugs: [] } });

		if (type === "report" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { reports: [] } });

		if (type === "suggestion" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { suggestions: [] } });

		if (type === "channel" || type === "all") {
			await Guilds.updateOne(
				{ id: interaction.guildId },
				{
					$set: {
						"channels.bugs": null,
						"channels.reports": null,
						"channels.suggestions": null,
						"channels.archive": null,
						"channels.bot_updates": null
					}
				}
			);
		}

		if (type === "role" || type === "all") {
			await Guilds.updateOne(
				{ id: interaction.guildId },
				{
					$set: {
						"roles.moderator": null,
						"roles.administrator": null
					}
				}
			);
		}

		if (type === "auto" || type === "all") {
			await Guilds.updateOne(
				{ id: interaction.guildId },
				{
					$set: {
						"auto.roles": [],
						"auto.delete": [],
						"auto.threads.bugs": false,
						"auto.threads.suggestions": false
					}
				}
			);
		}

		// prettier-ignore
		interaction.editReply({
			content: `Successfully wiped all${type !== "all" ? ` ${type}` : ""} data from the database!`,
			ephemeral: true
		});
	}
};
