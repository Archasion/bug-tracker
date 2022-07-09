const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder } = require("discord.js");

module.exports = class EditCommand extends Command {
	constructor(client) {
		super(client, {
			name: "edit",
			description: "Edit the report/suggestion fields",
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
					name: "type",
					description: "The type of message",
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
				},
				{
					name: "id",
					description:
						"The ID of the report/suggestion to change the status of (Shown in the footer)",
					type: Command.option_types.NUMBER,
					required: true
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
		const id = interaction.options.getNumber("id");

		const settings = await Guilds.findOne({ id: interaction.guildId });
		const report = settings[type].find(item => item.number === id);

		if (!report) {
			interaction.editReply({
				content: `There is no ${type.slice(0, -1)} with the ID of \`#${id}\``,
				ephemeral: true
			});
			return;
		}

		if (interaction.user.id !== report.author) {
			interaction.editReply({
				content: `You can only edit your own ${type}`,
				ephemeral: true
			});
			return;
		}

		const submissionChannel = interaction.guild.channels.cache.get(settings.channels[type]);

		if (!submissionChannel) {
			interaction.editReply({
				content: `There is no submission channel set for ${type}`,
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
		if (await utils.insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;

		const message = await submissionChannel.messages.fetch(report.messageId).catch(() => {
			interaction.editReply({
				content: `The message for ${type} with the ID of \`#${id}\` is either archived or deleted`,
				ephemeral: true
			});
			return;
		});

		if (!message) {
			interaction.editReply({
				content: `The message must be in ${submissionChannel}`,
				ephemeral: true
			});
			return;
		}

		if (message.author.id !== this.client.user.id) {
			interaction.editReply({
				content: "The message author must be the bot",
				ephemeral: true
			});
			return;
		}

		const embed = message.embeds[0].data;

		if (embed.author) {
			if (embed.author.name.includes("Status")) {
				interaction.editReply({
					content: `Cannot edit a ${type.slice(0, -1)} with a status`,
					ephemeral: true
				});
				return;
			}
		}

		const modalComponents = [];

		embed.fields.forEach(field => {
			if (field.name !== "Status Reason") {
				const inputField = new TextInputBuilder()
					.setCustomId(field.name.toLowerCase().replace(/ /g, "-"))
					.setLabel(field.name)
					.setValue(field.value)
					.setMinLength(6)
					.setRequired(true);

				if (field.name === "Reported Player" || field.name === "Summary") {
					inputField.setMaxLength(50);
					inputField.setStyle(TextInputStyle.Short);
				} else {
					inputField.setMaxLength(1024);
					inputField.setStyle(TextInputStyle.Paragraph);
				}

				const actionRow = new ActionRowBuilder().addComponents([inputField]);
				modalComponents.push(actionRow);
			}
		});

		const modal = new ModalBuilder()
			.setCustomId(`edit-report-${message.id}-${type}`)
			.setTitle(`Edit ${type.slice(0, -1)}`)
			.setComponents(modalComponents);

		await interaction.showModal(modal);
	}
};
