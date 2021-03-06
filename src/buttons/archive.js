const Button = require("../modules/buttons/button");
const Guilds = require("../db/models/guilds");

const { insufficientPermissions } = ValidationUtils;

module.exports = class ArchiveReportButton extends Button {
	constructor(client) {
		super(client, {
			custom_id: "archive-report",
			permission_level: 1
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const archiveChannel = interaction.guild.channels.cache.get(settings.channels.archive);

		if (!archiveChannel) {
			interaction.editReply({
				content: "There is no channel set for **archiving** reports/suggestions.\nYou can set one using `/channel set archive <channel>`",
				ephemeral: true
			});
			return;
		}

		const generalPermissions = [
			"ViewChannel",
			"ReadMessageHistory",
			"EmbedLinks",
			"ManageThreads"
		];

		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, generalPermissions)) return;
		const archivePermissions = ["ViewChannel", "EmbedLinks", "SendMessages"];
		// prettier-ignore
		if (await insufficientPermissions(this.client.user.id, interaction, archivePermissions, archiveChannel)) return;

		const { message } = interaction;
		const embed = message.embeds[0].data;

		if (message.thread) {
			await message.thread
				.edit({
					archived: true,
					locked: true
				})
				.catch(() => log.warn("Thread is already archived."));
		}

		archiveChannel.send({
			content: message.content,
			embeds: message.embeds,
			components: []
		});

		interaction.editReply({
			content: `${embed.title || "Suggestion"} **${embed.footer.text}** has been archived.`,
			ephemeral: true
		});

		message.delete();
	}
};
