const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

const { Attachment, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

const priorityImage = {
	NONE: new Attachment({ url: "assets/none-priority.png", filename: "NONE.png" }),
	LOW: new Attachment({ url: "assets/low-priority.png", filename: "LOW.png" }),
	MEDIUM: new Attachment({ url: "assets/medium-priority.png", filename: "MEDIUM.png" }),
	HIGH: new Attachment({ url: "assets/high-priority.png", filename: "HIGH.png" })
};

const statusImage = {
	approved: new Attachment({ url: "assets/status-approved.png", filename: "approved.png" }),
	rejected: new Attachment({ url: "assets/status-rejected.png", filename: "rejected.png" }),
	fixed: new Attachment({ url: "assets/status-fixed.png", filename: "fixed.png" }),
	considered: new Attachment({ url: "assets/status-considered.png", filename: "considered.png" })
};

module.exports = class StatusCommand extends Command {
	constructor(client) {
		super(client, {
			name: "status",
			description: "Change the status of a report/suggestion",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 1,
			permissions: [],
			options: [
				{
					name: "status",
					description: "The status to change the report/suggestion to",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Approved",
							value: "approved"
						},
						{
							name: "Rejected",
							value: "rejected"
						},
						{
							name: "Fixed",
							value: "fixed"
						},
						{
							name: "Implemented",
							value: "implemented"
						},
						{
							name: "Considered",
							value: "considered"
						},
						{
							name: "Revoke",
							value: "active"
						}
					]
				},
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
				},
				{
					name: "reason",
					description: "The reason for the status change",
					type: Command.option_types.STRING,
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
		const status = interaction.options.getString("status");
		const reason = interaction.options.getString("reason");
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

		const submissionChannel = interaction.guild.channels.cache.get(settings.channels[type]);

		const generalPermissions = [
			"SendMessages",
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks"
		];

		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions, submissionChannel)) return;

		if (!submissionChannel) {
			interaction.editReply({
				content: `There is no submission channel set for ${type}`,
				ephemeral: true
			});
			return;
		}

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
		embed.author = { name: `Status: ${status.toUpperCase()} (By ${interaction.user.tag})` };

		const approveButton = new ButtonBuilder({})
			.setCustomId("approve-report")
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success);

		const rejectButton = new ButtonBuilder({})
			.setCustomId("reject-report")
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger);

		const file = [];

		// ANCHOR Change bug report status
		if (type === "bugs") {
			if (status === "implemented") {
				interaction.editReply({
					content: "This status is not applicable to bugs",
					ephemeral: true
				});
				return;
			}

			embed.color = config.colors.status[status];
			embed.thumbnail.url = `attachment://${status}.png`;
			if (status !== "active") file.push(statusImage[status]);

			if (reason && status !== "active") {
				if (embed.fields[3]) embed.fields[3].value = reason;
				else {
					embed.fields.push({
						name: "Status Reason",
						value: reason,
						inline: false
					});
				}
			}

			if (status === "active") {
				embed.color = config.colors.priority[report.priority.toLowerCase()];
				embed.author.name = `Priority: ${report.priority}`;
				embed.thumbnail.url = `attachment://${report.priority}.png`;
				file.push(priorityImage[report.priority]);

				if (embed.fields[3]) embed.fields.splice(3, 1);
			}
		}

		// ANCHOR Change player report status
		if (type === "reports") {
			if (status === "implemented" || status === "fixed") {
				interaction.editReply({
					content: "This status is not applicable to bugs",
					ephemeral: true
				});
				return;
			}

			embed.color = config.colors.status[status];

			if (reason && status !== "active") {
				if (embed.fields[2]) embed.fields[2].value = reason;
				else {
					embed.fields.push({
						name: "Status Reason",
						value: reason,
						inline: false
					});
				}
			}

			if (status === "active") {
				embed.color = config.colors.default;
				embed.author = null;
				if (embed.fields[2]) embed.fields.splice(2, 1);
			}
		}

		// ANCHOR Change suggestion status
		if (type === "suggestions") {
			if (status === "fixed") {
				interaction.editReply({
					content: "This status is not applicable to bugs",
					ephemeral: true
				});
				return;
			}

			embed.color = config.colors.status[status];

			if (reason && status !== "active") {
				if (embed.fields[1]) embed.fields[1].value = reason;
				else {
					embed.fields.push({
						name: "Status Reason",
						value: reason,
						inline: false
					});
				}
			}

			if (status === "active") {
				embed.color = config.colors.default;
				embed.author = null;
				if (embed.fields[1]) embed.fields.splice(1, 1);
			}
		}

		if (status === "approved") approveButton.setDisabled(true);
		if (status === "rejected") rejectButton.setDisabled(true);

		message.components[0].components[0] = approveButton;
		message.components[0].components[1] = rejectButton;

		message.edit({
			content: message.content,
			embeds: [embed],
			files: file,
			components: message.components
		});

		// prettier-ignore
		if (status !== "active") {
			interaction.editReply({
				content: `The status of ${type.slice(0, -1)} **#${id}** has been changed to \`${status}\``,
				ephemeral: true
			});
		} else {
			interaction.editReply({
				content: `The status of ${type.slice(0, -1)} **#${id}** has been revoked.`,
				ephemeral: true
			});
		}

		if (settings.auto.dm.status === true) {
			const reportAuthor = await interaction.guild.members.fetch(report.author);
			try {
				// prettier-ignore
				const statusChangeConfirmation = new EmbedBuilder()
					.setColor(config.colors.status[status])
					.setDescription(`Your **${type.slice(0, -1)}** with the ID of **#${report.number}** has been **${status}** by ${interaction.member} (\`${interaction.member.id}\`)`)
					.setTimestamp();

				if (reason && status !== "active") {
					statusChangeConfirmation.setFields([{ name: "Reason", value: reason }]);
				}

				// prettier-ignore
				const jumpToReport = new ButtonBuilder({})
					.setURL(`https://discordapp.com/channels/${interaction.guildId}/${message.channelId}/${report.messageId}`)
					.setLabel("Jump to Message")
					.setStyle(ButtonStyle.Link);

				const buttonContainer = new ActionRowBuilder().addComponents([jumpToReport]);

				reportAuthor.send({
					embeds: [statusChangeConfirmation],
					components: [buttonContainer]
				});
			} catch {
				log.warn("Couldn't message report/suggestion author.");
			}
		}
	}
};
