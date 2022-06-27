const EventListener = require("../modules/listeners/listener");
const Guilds = require("../mongodb/models/guilds");

const {
	EmbedBuilder,
	Attachment,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	InteractionType
} = require("discord.js");

const priorityImage = {
	NONE: new Attachment({ url: "images/none-priority.png", filename: "NONE.png" }),
	LOW: new Attachment({ url: "images/low-priority.png", filename: "LOW.png" }),
	MEDIUM: new Attachment({ url: "images/medium-priority.png", filename: "MEDIUM.png" }),
	HIGH: new Attachment({ url: "images/high-priority.png", filename: "HIGH.png" })
};

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "interactionCreate" });
	}

	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const { customId } = interaction;
		log.debug(interaction);

		// ANCHOR Slash Commands
		if (interaction.type === InteractionType.ApplicationCommand) {
			this.client.commands.handle(interaction);
		}

		// ANCHOR Buttons
		else if (interaction.type === InteractionType.MessageComponent) {
			this.client.buttons.handle(interaction);
		}

		// SECTION Modals
		else if (interaction.type === InteractionType.ModalSubmit) {
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

			const reportPlayerActionRow = new ActionRowBuilder().addComponents([
				approveButton,
				rejectButton,
				archiveButton
			]);

			const reportActionRow = new ActionRowBuilder().addComponents([
				approveButton,
				rejectButton,
				discussionThreadButton,
				archiveButton
			]);

			if (customId === "bot-update-announcement") {
				const title = interaction.fields.getTextInputValue("title");
				const description = interaction.fields.getTextInputValue("description");

				const announcement = new EmbedBuilder()

					.setColor(config.colors.default)
					.setTitle(title)
					.setDescription(description)
					.setTimestamp();

				const publishingGuilds = await Guilds.find({
					"channels.bot_updates": { $ne: null }
				});

				interaction.reply({
					content: "Publishing message to guilds...",
					ephemeral: true
				});

				for (const item of publishingGuilds) {
					const announcementChannel = this.client.channels.cache.get(
						item.channels.bot_updates
					);

					if (announcementChannel) {
						announcementChannel.send({
							embeds: [announcement]
						});
						log.info(
							`Published bot update to "${announcementChannel.guild.name}" (${announcementChannel.guild.id})`
						);
					}
				}
			}

			// ANCHOR Report Bug
			if (customId.startsWith("report-bug")) {
				const submissionChannel = interaction.guild.channels.cache.get(
					settings.channels.bugs
				);

				if (!submissionChannel) {
					interaction.reply({
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
				if (await utils.insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;

				const summary = interaction.fields.getTextInputValue("summary");
				const description = interaction.fields.getTextInputValue("description");
				const specs = interaction.fields.getTextInputValue("specs");
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
						components: [reportActionRow]
					})
					.then(async message => {
						try {
							message
								.react("968494477524213821")
								.catch(() => message.react("👍"));
							message
								.react("968494477369016400")
								.catch(() => message.react("👎"));
						} catch {
							log.warn("No reaction perms");
						}

						if (settings.auto.threads.bugs) {
							message.startThread({
								name:
									summary.length > 97
										? `${summary.slice(0, 97)}...`
										: summary,
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

				interaction.reply({
					content: "Thank you for your report, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Report Player
			if (customId === "report-player") {
				const submissionChannel = interaction.guild.channels.cache.get(
					settings.channels.reports
				);

				if (!submissionChannel) {
					interaction.reply({
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
				if (await utils.insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;

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
						components: [reportPlayerActionRow]
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

				interaction.reply({
					content: "Thank you for your report, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Suggestion
			if (customId === "suggestion") {
				const submissionChannel = interaction.guild.channels.cache.get(
					settings.channels.suggestions
				);

				if (!submissionChannel) {
					interaction.reply({
						content: "The suggestion submission channel cannot be found.",
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
				if (await utils.insufficientPermissions(interaction, generalPermissions, submissionChannel)) return;
				const suggestion = interaction.fields.getTextInputValue("suggestion");

				const embed = new EmbedBuilder()

					.setFields([
						{
							name: "Suggestion",
							value: suggestion,
							inline: false
						}
					])
					.setColor(config.colors.default)
					.setFooter({ text: `#${settings.suggestions.length + 1}` })
					.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
					.setTimestamp();

				submissionChannel
					.send({
						content: `${interaction.member} (\`${interaction.user.tag}\`)`,
						embeds: [embed],
						components: [reportActionRow]
					})
					.then(async message => {
						try {
							message
								.react("968494477524213821")
								.catch(() => message.react("👍"));
							message
								.react("968494477369016400")
								.catch(() => message.react("👎"));
						} catch {
							log.warn("No reaction perms");
						}

						if (settings.auto.threads.suggestions) {
							message.startThread({
								name:
									suggestion.length > 97
										? `${suggestion.slice(0, 97)}...`
										: suggestion,
								autoArchiveDuration: 10080, // 1 Week
								reason: "Started a discussion thread for a report/suggestion"
							});
						}

						await Guilds.updateOne(
							{ id: interaction.guildId },
							{
								$push: {
									suggestions: {
										number: settings.suggestions.length + 1,
										messageId: message.id,
										author: interaction.member.id,
										suggestion
									}
								}
							}
						);
					});

				interaction.reply({
					content: "Thank you for your suggestion, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Edit report
			if (customId.startsWith("edit-report")) {
				const type = customId.split("-")[3];

				// prettier-ignore
				const channel = interaction.guild.channels.cache.get(settings.channels[type]);

				if (!channel) {
					interaction.reply({
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
				if (await utils.insufficientPermissions(interaction, generalPermissions, channel)) return;

				const message = await channel.messages.fetch(customId.split("-")[2]);

				if (!message) {
					interaction.reply({
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

				interaction.reply({
					content: "Edited",
					ephemeral: true
				});
			}
		}
		// !SECTION
	}
};
