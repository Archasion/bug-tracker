const Command = require("../modules/commands/command");
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = class ContactCommand extends Command {
	constructor(client) {
		super(client, {
			name: "contact",
			description: "Contact the developer of the bot",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			has_modal: true,
			permissions: [],
			options: [
				{
					name: "enquiry",
					description: "What is the reason you are contacting the developer?",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bot support",
							value: "support"
						},
						{
							name: "Suggestions for the development of the bot",
							value: "suggestions"
						},
						{
							name: "Report encountered bugs",
							value: "bugs"
						},
						{
							name: "Provide feedback",
							value: "feedback"
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
		const enquiry = interaction.options.getString("enquiry");
		const modalComponents = [];

		switch (enquiry) {
			case "support":
				modalComponents.push(
					new ActionRowBuilder().addComponents([
						new TextInputBuilder()
							.setCustomId("description")
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("What is the reason for your support request?")
							.setPlaceholder("I need assistance with...")
							.setMinLength(10)
							.setValue("")
							.setRequired(true)
					])
				);

				break;

			case "suggestions":
				modalComponents.push(
					new ActionRowBuilder().addComponents([
						// prettier-ignore
						new TextInputBuilder()
							.setCustomId("description")
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("What are your suggestions for the bot?")
							.setPlaceholder("e.g. Add a new feature, alter a current feature, etc.")
							.setMinLength(10)
							.setValue("")
							.setRequired(true)
					])
				);

				break;

			case "bugs":
				modalComponents.push(
					new ActionRowBuilder().addComponents([
						new TextInputBuilder()
							.setCustomId("description")
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("Briefly describe the encountered issue.")
							.setPlaceholder("Bug description...")
							.setMinLength(10)
							.setValue("")
							.setRequired(true)
					]),

					new ActionRowBuilder().addComponents([
						new TextInputBuilder()
							.setCustomId("bug-reproduction")
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("Steps to reproduce the bug (if applicable)")
							.setPlaceholder("- Step 1: ...\n- Step 2: ...\n- Step 3: ...")
							.setMaxLength(1024)
							.setValue("")
							.setRequired(false)
					])
				);

				break;

			case "feedback":
				modalComponents.push(
					new ActionRowBuilder().addComponents([
						new TextInputBuilder()
							.setCustomId("description")
							.setStyle(TextInputStyle.Paragraph)
							.setLabel("What feedback do you have for the developer?")
							.setPlaceholder("Bot feedback...")
							.setMinLength(10)
							.setValue("")
							.setRequired(true)
					])
				);

				break;
		}

		// TODO Shorten labels to 45 chars

		const form = new ModalBuilder()
			.setCustomId(`contact-form-${enquiry}`)
			.setTitle("Contact Form")
			.addComponents(modalComponents);

		await interaction.showModal(form);
	}
};
