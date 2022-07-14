const Modal = require("../modules/modals/modal");
const { EmbedBuilder } = require("discord.js");

module.exports = class ContactFormModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: { starts_with: "contact-form" },
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const enquiry = interaction.customId.split("-")[2];
		const contactChannel = this.client.channels.cache.get(config.channels.bot[enquiry]);

		let embedTitle = "Unknown";
		const embedDescription = interaction.fields.getTextInputValue("description") || "Unknown";
		const embedFields = [];

		switch (enquiry) {
			case "support":
				embedTitle = "Support Request";
				break;
			case "suggestions":
				embedTitle = "Suggestion(s)";
				break;
			case "bugs":
				// prettier-ignore
				const reproductionSteps = interaction.fields.getTextInputValue("bug-reproduction");
				embedTitle = "Bug Report";

				if (reproductionSteps)
					embedFields.push({
						name: "Reproduction Steps",
						value: reproductionSteps
					});

				break;
			case "feedback":
				embedTitle = "Feedback";
				break;
		}

		const embed = new EmbedBuilder()

			.setColor(config.colors.default)
			.setTitle(embedTitle)
			.setDescription(embedDescription)
			.setTimestamp()
			.setFooter({
				text: `ID: ${interaction.user.id}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true })
			});

		if (embedFields[0]) embed.setFields(embedFields);

		try {
			// prettier-ignore
			await contactChannel
				.send({ content: `<@${config.users.developers[0]}>`, embeds: [embed] })
				.then(interaction.editReply(`Your enquiry regarding \`${enquiry}\` has been sent to the developer! Your DMs must be open if you would like to receive a response.`));
		} catch {
			// prettier-ignore
			interaction.editReply("An error occurred while sending your enquiry. Please try again later.");
		}
	}
};
