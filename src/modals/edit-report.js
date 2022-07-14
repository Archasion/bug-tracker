const Modal = require("../modules/modals/modal");
const Guilds = require("../db/models/guilds");

const { insufficientPermissions } = ValidationUtils;

module.exports = class EditModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: { starts_with: "edit-report" },
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const { customId } = interaction;

		const type = customId.split("-")[3];

		// prettier-ignore
		const channel = interaction.guild.channels.cache.get(settings.channels[type]);

		if (!channel) {
			interaction.editReply({
				content: `Cannot find the ${type.slice(0, -1)} submission channel.`,
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
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions, channel)) return;

		const message = await channel.messages.fetch(customId.split("-")[2]);

		if (!message) {
			interaction.editReply({
				content: "The message you are trying to edit does not exist anymore.",
				ephemeral: true
			});
			return;
		}

		const embed = message.embeds[0].data;

		embed.fields.forEach(field => {
			const inputLabel = field.name.toLowerCase().replace(/ /g, "-");
			field.value = interaction.fields.getTextInputValue(inputLabel);
		});

		message.edit({
			embeds: [embed],
			attachments: []
		});

		interaction.editReply({
			content: "Edited",
			ephemeral: true
		});
	}
};
