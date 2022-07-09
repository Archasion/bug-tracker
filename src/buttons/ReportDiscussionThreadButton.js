const Button = require("../modules/buttons/button");
const Guilds = require("../mongodb/models/guilds");

module.exports = class ReportDiscussionThreadButton extends Button {
	constructor(client) {
		super(client, {
			custom_id: "report-discussion-thread",
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
			"CreatePublicThreads"
		];

		// prettier-ignore
		if (await utils.insufficientPermissions(interaction, generalPermissions)) return;

		if (interaction.message.hasThread) {
			interaction.editReply({
				content: "This message already has a thread.",
				ephemeral: true
			});
			return;
		}

		let threadName;
		let type;

		for (const item of settings.suggestions) {
			if (item.messageId === interaction.message.id) {
				threadName =
					item.suggestion.length > 97
						? `${item.suggestion.slice(0, 97)}...`
						: item.suggestion;
				type = "suggestion";
				break;
			}
		}

		for (const item of settings.bugs) {
			if (item.messageId === interaction.message.id) {
				threadName =
					item.summary.length > 97
						? `${item.summary.slice(0, 97)}...`
						: item.summary;
				type = "bug";
				break;
			}
		}

		if (!threadName) {
			interaction.editReply({
				content: "I couldn't find the information required to make a discussion thread",
				ephemeral: true
			});
			return;
		}

		interaction.message.startThread({
			name: threadName,
			autoArchiveDuration: 10080, // 1 Week
			reason: "Started a discussion thread for a report/suggestion"
		});

		interaction.editReply({
			content: `Started a discussion thread for ${type} **${interaction.message.embeds[0].data.footer.text}**`,
			ephemeral: true
		});
	}
};
