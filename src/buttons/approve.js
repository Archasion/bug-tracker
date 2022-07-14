const Button = require("../modules/buttons/button");
const Guilds = require("../db/models/guilds");

const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder, Attachment } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

const approvedImage = new Attachment({ url: "assets/status-approved.png", filename: "approved.png" });

module.exports = class ApproveReportButton extends Button {
	constructor(client) {
		super(client, {
			custom_id: "approve-report",
			permission_level: 1
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });

		const generalPermissions = [
			"SendMessages",
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks"
		];

		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions)) return;

		const embed = interaction.message.embeds[0].data;

		let type;
		const file = [];

		embed.color = config.colors.status.approved;
		embed.author = {
			name: `Status: APPROVED (By ${interaction.user.tag})`
		};

		switch (embed.title) {
			case "Bug Report":
				type = "bugs";

				if (embed.fields[3]) embed.fields.splice(3, 1);

				embed.thumbnail.url = "attachment://approved.png";
				file.push(approvedImage);
				break;

			case "Player Report":
				if (embed.fields[2]) embed.fields.splice(2, 1);
				type = "reports";
				break;

			default:
				if (embed.fields[1]) embed.fields.splice(1, 1);
				type = "suggestions";
				break;
		}

		const report = settings[type].find(item => item.messageId === interaction.message.id);

		const disabledButton = new ButtonBuilder({})
			.setCustomId(interaction.customId)
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success)
			.setDisabled(true);

		const enabledButton = new ButtonBuilder({})
			.setCustomId("reject-report")
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger);

		interaction.message.components[0].components[0] = disabledButton;
		interaction.message.components[0].components[1] = enabledButton;

		interaction.message.edit({
			content: interaction.message.content,
			embeds: [embed],
			files: file,
			components: interaction.message.components
		});

		interaction.editReply({
			content: `The ${type.slice(0, -1)} **#${report.number}** has been approved.`,
			ephemeral: true
		});

		if (settings.auto.dm.status === true) {
			const reportAuthor = await interaction.guild.members.fetch(report.author);

			try {
				// prettier-ignore
				const statusChangeConfirmation = new EmbedBuilder()
					.setColor(config.colors.status.approved)
					.setDescription(`Your **${type.slice(0, -1)}** with the ID of **#${report.number}** has been **approved** by ${interaction.member} (\`${interaction.member.id}\`)`)
					.setTimestamp();

				const jumpToReport = new ButtonBuilder({})
					.setURL(interaction.message.url)
					.setLabel("Jump to Message")
					.setStyle(ButtonStyle.Link);

				const buttonRow = new ActionRowBuilder().addComponents([jumpToReport]);

				reportAuthor.send({
					embeds: [statusChangeConfirmation],
					components: [buttonRow]
				});
			} catch {
				log.warn("Couldn't message report author.");
			}
		}
	}
};
