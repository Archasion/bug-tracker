const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

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
					name: "set",
					description: "Set a channel configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
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
							required: true
						}
					]
				},
				{
					name: "reset",
					description: "Reset a channel configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
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
						}
					]
				},
				{
					name: "view",
					description: "View a channel configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
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
						}
					]
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const action = interaction.options.getSubcommand();
		const type = interaction.options.getString("type");

		switch (action) {
			case "set":
				const channel = interaction.options.getChannel("channel");

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
				if (await ValidationUtils.insufficientPermissions(interaction, generalPermissions, channel)) return;

				const suggestionBugPermissions = [
					"CreatePublicThreads",
					"ManageThreads",
					"AddReactions",
					"UseExternalEmojis"
				];

				// prettier-ignore
				if ((type === "bugs" || type === "suggestions") && await ValidationUtils.insufficientPermissions(interaction, suggestionBugPermissions, channel)) return;

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
