const Modal = require("../modules/modals/modal");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Attachment } = require("discord.js");
const { insufficientPermissions } = ValidationUtils;

const priorityImage = {
	NONE: new Attachment({ url: "assets/none-priority.png", filename: "NONE.png" }),
	LOW: new Attachment({ url: "assets/low-priority.png", filename: "LOW.png" }),
	MEDIUM: new Attachment({ url: "assets/medium-priority.png", filename: "MEDIUM.png" }),
	HIGH: new Attachment({ url: "assets/high-priority.png", filename: "HIGH.png" })
};

module.exports = class ReportBugModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: { starts_with: "report-bug" },
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const submissionChannel = interaction.guild.channels.cache.get(settings.channels.bugs);

		if (!submissionChannel) {
			interaction.editReply({
				content: "The bug report submission channel cannot be found.",
				ephemeral: true
			});
			return;
		}

		const generalPermissions = [
			"SendMessages",
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks",
			"AddReactions",
			"UseExternalEmojis",
			"CreatePublicThreads",
			"ManageThreads"
		];

		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions, submissionChannel)) return;

		const approveButton = new ButtonBuilder({})

			.setCustomId("approve-report")
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success);

		const rejectButton = new ButtonBuilder({})

			.setCustomId("reject-report")
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger);

		const discussionThreadButton = new ButtonBuilder({})

			.setCustomId("report-discussion-thread")
			.setLabel("Discussion Thread")
			.setStyle(ButtonStyle.Secondary);

		const archiveButton = new ButtonBuilder({})

			.setCustomId("archive-report")
			.setLabel("Archive")
			.setStyle(ButtonStyle.Secondary);

		const actionRow = new ActionRowBuilder().addComponents([
			approveButton,
			rejectButton,
			discussionThreadButton,
			archiveButton
		]);

		const { fields, customId } = interaction;

		const summary = fields.getTextInputValue("summary");
		const description = fields.getTextInputValue("description");
		const specs = fields.getTextInputValue("specs");
		const priority = customId.split("-")[2].toUpperCase();

		const report = new EmbedBuilder()
			.setFields([
				{
					name: "Summary",
					value: summary,
					inline: false
				},
				{
					name: "Description",
					value: description,
					inline: false
				},
				{
					name: "System Specs",
					value: specs,
					inline: false
				}
			])
			.setColor(config.colors.priority[priority.toLowerCase()])
			.setTitle("Bug Report")
			.setAuthor({ name: `Priority: ${priority}` })
			.setFooter({ text: `#${settings.bugs.length + 1}` })
			.setThumbnail(`attachment://${priority}.png`)
			.setTimestamp();

		submissionChannel
			.send({
				content: `${interaction.member} (\`${interaction.user.tag}\`)`,
				embeds: [report],
				files: [priorityImage[priority]],
				components: [actionRow]
			})
			.then(async message => {
				try {
					message.react("968494477524213821").catch(() => message.react("👍"));
					message.react("968494477369016400").catch(() => message.react("👎"));
				} catch {
					log.warn("No reaction perms");
				}

				if (settings.auto.threads.bugs) {
					message.startThread({
						name: summary.length > 97 ? `${summary.slice(0, 97)}...` : summary,
						autoArchiveDuration: 10080, // 1 Week
						reason: "Started a discussion thread for a report/suggestion"
					});
				}

				await Guilds.updateOne(
					{ id: interaction.guildId },
					{
						$push: {
							bugs: {
								number: settings.bugs.length + 1,
								messageId: message.id,
								author: interaction.member.id,
								priority,
								summary,
								description,
								specs
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
