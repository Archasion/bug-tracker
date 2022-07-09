const Command = require("../modules/commands/command");

const { EmbedBuilder } = require("discord.js");

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: "eval",
			description: "Evaluates code.",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			options: [
				{
					description: "The code to evaluate.",
					name: "code",
					required: true,
					type: Command.option_types.STRING
				},
				{
					description: "Should the result be sent publicly?",
					name: "public",
					required: false,
					type: Command.option_types.BOOLEAN
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const codeToEvaluate = interaction.options.getString("code");
		const publicResult = interaction.options.getBoolean("public") ?? false;

		// Prevent evaluation of environmental code
		if (codeToEvaluate.match(/(env|DISCORD_TOKEN|DB_ENCRYPTION_KEY|NDA_FORM_KEY)/gi)) {
			return interaction.editReply({
				content: "Cannot evaluate code that contains sensitive information.",
				ephemeral: !publicResult
			});
		}

		const embed = new EmbedBuilder().setColor(config.colors.default);

		try {
			// Evaluate the code
			let evaluatedCode = eval(codeToEvaluate);

			// Stringify the result if it's an object
			if (typeof evaluatedCode === "object")
				evaluatedCode = JSON.stringify(evaluatedCode, null, "\t");

			// Respond with an error if the result type is invalid
			if (
				typeof evaluatedCode !== "string" &&
				typeof evaluatedCode !== "number" &&
				typeof evaluatedCode !== "boolean"
			) {
				return await interaction.editReply({
					content: `The output could not be converted to text (output type: ${typeof evaluatedCode})`,
					ephemeral: !publicResult
				});
			}

			embed.setTitle("Evaluated code");
			embed.setDescription(`\`\`\`js\n${evaluatedCode}\n\`\`\``);
			embed.setTimestamp();
		} catch (error) {
			embed.setTitle("Failed to evaluate code");
			embed.setDescription(`\`\`\`js\n${error}\n\`\`\``);
			embed.setTimestamp();
		}

		// Send the result
		return interaction.editReply({
			embeds: [embed],
			ephemeral: !publicResult
		});
	}
};
