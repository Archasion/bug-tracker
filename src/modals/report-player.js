const Modal = require("../modules/modals/modal");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

module.exports = class ReportPlayerModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: "report-player",
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const submissionChannel = interaction.guild.channels.cache.get(settings.channels.reports);

		if (!submissionChannel) {
			interaction.editReply({
				content: "The player report submission channel cannot be found.",
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
		if (await insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;

		const approveButton = new ButtonBuilder({})

			.setCustomId("approve-report")
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success);

		const rejectButton = new ButtonBuilder({})

			.setCustomId("reject-report")
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger);

		const archiveButton = new ButtonBuilder({})

			.setCustomId("archive-report")
			.setLabel("Archive")
			.setStyle(ButtonStyle.Secondary);

		const actionRow = new ActionRowBuilder().addComponents([
			approveButton,
			rejectButton,
			archiveButton
		]);

		const player = interaction.fields.getTextInputValue("player");
		const reason = interaction.fields.getTextInputValue("reason");

		const report = new EmbedBuilder()

			.setFields([
				{
					name: "Reported Player",
					value: player,
					inline: false
				},
				{
					name: "Reason",
					value: reason,
					inline: false
				}
			])
			.setColor(config.colors.default)
			.setTitle("Player Report")
			.setFooter({ text: `#${settings.reports.length + 1}` })
			.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		submissionChannel
			.send({
				content: `${interaction.member} (\`${interaction.user.tag}\`)`,
				embeds: [report],
				components: [actionRow]
			})
			.then(async message => {
				await Guilds.updateOne(
					{ id: interaction.guildId },
					{
						$push: {
							reports: {
								number: settings.reports.length + 1,
								messageId: message.id,
								author: interaction.member.id,
								player,
								reason
							}
						}
					}
				);
			});

		interaction.editReply({
			content: "Thank you for your report, we will look into it as soon as possible.",
			ephemeral: true
		});
	}
};
