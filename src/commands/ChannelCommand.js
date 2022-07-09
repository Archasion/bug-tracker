const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { ChannelType } = require("discord.js");

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: "channel",
			description: "Manage the channels for the bot",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 2,
			options: [
				{
					name: "action",
					description: "What action to perform",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Set",
							value: "set"
						},
						{
							name: "Reset",
							value: "reset"
						},
						{
							name: "View",
							value: "view"
						}
					]
				},
				{
					name: "type",
					description: "The type of channel to perform the action on",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bug Reports",
							value: "bugs"
						},
						{
							name: "Player Reports",
							value: "reports"
						},
						{
							name: "Suggestions",
							value: "suggestions"
						},
						{
							name: "Archive",
							value: "archive"
						},
						{
							name: "Bot Updates",
							value: "bot_updates"
						}
					]
				},
				{
					name: "channel",
					description: "The channel to perform the action on",
					type: Command.option_types.CHANNEL,
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
		const channel = interaction.options.getChannel("channel");
		const action = interaction.options.getString("action");
		const type = interaction.options.getString("type");

		switch (action) {
			case "set":
				if (!channel) {
					interaction.editReply({
						content: "You must specify a channel to set.",
						ephemeral: true
					});
					return;
				}

				// prettier-ignore
				// Only allow Text or Announcement (News) channels
				if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildNews) {
					interaction.editReply({
						content: "The channel you specified is not a text channel.",
						ephemeral: true
					});
					return;
				}

				const generalPermissions = ["SendMessages", "ViewChannel", "ReadMessageHistory"];

				// prettier-ignore
				if (await utils.insufficientPermissions(interaction, generalPermissions, channel)) return;

				const suggestionBugPermissions = [
					"CreatePublicThreads",
					"ManageThreads",
					"AddReactions",
					"UseExternalEmojis"
				];

				// prettier-ignore
				if ((type === "bugs" || type === "suggestions") && await utils.insufficientPermissions(interaction, suggestionBugPermissions, channel)) return;

				await Guilds.updateOne(
					{ id: interaction.guildId },
					{ $set: { [`channels.${type}`]: channel.id } }
				);

				interaction.editReply({
					content: `The **${type}** channel has been set to ${channel}.`,
					ephemeral: true
				});

				break;

			case "reset":
				await Guilds.updateOne(
					{ id: interaction.guildId },
					{ $set: { [`channels.${type}`]: null } }
				);

				interaction.editReply({
					content: `The **${type}** channel has been reset.`,
					ephemeral: true
				});

				break;

			case "view":
				const settings = await Guilds.findOne({ id: interaction.guildId });
				const channelId = settings.channels[type];

				// prettier-ignore
				if (!channelId) {
					interaction.editReply({
						content: `There is no channel set for **${type}** reports.\nYou can set one using \`/channel set ${type.replace(/_/g, " ")} <channel>\``,
						ephemeral: true
					});
					return;
				}

				// prettier-ignore
				interaction.editReply({
					content: `The **${type.replace(/_/g, " ")}** channel is set to <#${channelId}>.`,
					ephemeral: true
				});
		}
	}
};
