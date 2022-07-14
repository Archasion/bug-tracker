const Command = require("../modules/commands/command");
const { EmbedBuilder, Attachment } = require("discord.js");

const formImage = {
	bug: new Attachment({ url: "images/bug-form.png", filename: "bug.png" }),
	player: new Attachment({ url: "images/player-form.png", filename: "player.png" }),
	suggestion: new Attachment({ url: "images/suggestion-form.png", filename: "suggestion.png" })
};

module.exports = class GuideCommand extends Command {
	constructor(client) {
		super(client, {
			name: "guide",
			description: "View the guides for reports and suggestions",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "guide",
					description: "The guide you want to view",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "How to Report Bugs",
							value: "bug"
						},
						{
							name: "How to Report Player",
							value: "player"
						},
						{
							name: "How to Suggest",
							value: "suggestion"
						}
					]
				},
				{
					name: "public",
					description: "Whether or not the guide should be sent publicly",
					type: Command.option_types.BOOLEAN,
					required: false
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		let publicMessage = interaction.options.getBoolean("public") || false;
		const type = interaction.options.getString("guide");

		if (!(await ValidationUtils.isModerator(interaction.member)) && publicMessage)
			publicMessage = false;

		let guide;

		// prettier-ignore
		if (type === "bug" || type === "player") {
			guide = new EmbedBuilder()

				.setColor(config.colors.default)
				.setTitle(`${type.charAt(0).toUpperCase()}${type.slice(1)} Reporting Guide`)
				.setDescription(`Want to report a ${type}? Here's how to do it!\n\nAll you need to do is use the command written below, fill out the form and submit the ${type} report!`)
				.setFields([
					{
						name: "Command",
						value: `\`/report ${type}\`${type === "bug" ? " (optional: `priority`)" : ""}`
					}
				]);
		}

		// prettier-ignore
		if (type === "suggestion") {
			guide = new EmbedBuilder()

				.setColor(config.colors.default)
				.setTitle("Suggestion Guide")
				.setDescription("Want to suggest something? Here's how to do it!\n\nAll you need to do is use the command written below, fill out the form and submit the suggestion!")
				.setFields([
					{
						name: "Command",
						value: "`/suggest`"
					}
				]);
		}

		guide.setImage(`attachment://${type}.png`);

		interaction.editReply({
			embeds: [guide],
			files: [formImage[type]],
			ephemeral: !publicMessage
		});
	}
};
