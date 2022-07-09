const Modal = require("../modules/modals/modal");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = class SuggestionModal extends Modal {
	constructor(client) {
		super(client, {
			custom_id: "suggestion",
			permission_level: 0
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const submissionChannel = interaction.guild.channels.cache.get(
			settings.channels.suggestions
		);

		if (!submissionChannel) {
			interaction.editReply({
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
				components: [actionRow]
			})
			.then(async message => {
				try {
					message.react("968494477524213821").catch(() => message.react("👍"));
					message.react("968494477369016400").catch(() => message.react("👎"));
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

		interaction.editReply({
			content: "Thank you for your suggestion, we will look into it as soon as possible.",
			ephemeral: true
		});
	}
};
