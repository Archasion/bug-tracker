const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = class AutoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "auto",
			description: "Configure automated tasks",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 2,
			permissions: [],
			options: [
				{
					name: "thread",
					description: "Automate discussion thread creation",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description:
								"The type of messages to create discussion threads for",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Bug Reports",
									value: "bugs"
								},
								{
									name: "Suggestions",
									value: "suggestions"
								}
							]
						},
						{
							name: "enabled",
							description: "Whether or not this task is enabled",
							type: Command.option_types.BOOLEAN,
							required: true
						}
					]
				},
				{
					name: "dm",
					description:
						"Send members a DM confirmation when they submit a report or the status of their reports gets changed",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description:
								"The type of messages to create discussion threads for",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Report/Suggestion Status Change",
									value: "status"
								}
							]
						},
						{
							name: "enabled",
							description: "Whether or not this task is enabled",
							type: Command.option_types.BOOLEAN,
							required: true
						}
					]
				},
				{
					name: "role",
					description: "Automatically assign role(s) to new members",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "action",
							description: "The action to take",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Add",
									value: "add"
								},
								{
									name: "Remove",
									value: "remove"
								},
								{
									name: "View",
									value: "view"
								}
							]
						},
						{
							name: "role",
							description: "The role you want to assign to new members",
							type: Command.option_types.ROLE,
							required: false
						}
					]
				},
				{
					name: "delete",
					description: "Automatically delete messages in certain channels",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "action",
							description: "The action to take",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Add",
									value: "add"
								},
								{
									name: "Remove",
									value: "remove"
								},
								{
									name: "View",
									value: "view"
								}
							]
						},
						{
							name: "channel",
							description: "The channel you want message to be removed in",
							type: Command.option_types.CHANNEL,
							required: false
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
		const subCommand = interaction.options.getSubcommand();
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const bot = await interaction.guild.members.fetch(this.client.user.id);

		// ANCHOR Automatic Thread Creation
		if (subCommand === "thread") {
			const enabled = interaction.options.getBoolean("enabled");
			const type = interaction.options.getString("type");

			const channelId = settings.channels[type];

			if (!channelId) {
				interaction.editReply({
					content: `There is no channel set for **${type}**.`,
					ephemeral: true
				});
				return;
			}

			const channel = interaction.guild.channels.cache.get(channelId);

			if (!channel) {
				interaction.editReply({
					content: `The channel for **${type}** is not valid.`,
					ephemeral: true
				});
				return;
			}

			const generalPermissions = [
				"SendMessages",
				"ViewChannel",
				"ReadMessageHistory",
				"CreatePublicThreads"
			];

			// prettier-ignore
			if (await ValidationUtils.insufficientPermissions(interaction, generalPermissions, channel)) return;

			// prettier-ignore
			if (settings.auto.threads[type] === enabled) {
				interaction.editReply({
					content: `The ${type.slice(0, -1)} discussion thread creation is already ${enabled ? "enabled" : "disabled"}.`,
					ephemeral: true
				});
				return;
			}

			// prettier-ignore
			await Guilds.updateOne({ id: interaction.guildId }, { [`auto.threads.${type}`]: enabled });

			// prettier-ignore
			interaction.editReply({
				content: `The ${type.slice(0, -1)} discussion thread creation has been ${enabled ? "enabled" : "disabled"}.`,
				ephemeral: true
			});
			return;
		}

		// ANCHOR DM Confirmation
		if (subCommand === "dm") {
			const enabled = interaction.options.getBoolean("enabled");
			const type = interaction.options.getString("type");

			if (settings.auto.dm[type] === enabled) {
				interaction.editReply({
					content: `This option is already ${enabled ? "enabled" : "disabled"}.`,
					ephemeral: true
				});
				return;
			}

			await Guilds.updateOne({ id: interaction.guildId }, { [`auto.dm.${type}`]: enabled });

			// prettier-ignore
			interaction.editReply({
				content: `Members will ${enabled ? "now" : "no longer"} be messaged whenever their report/suggestion status changes`,
				ephemeral: true
			});
			return;
		}

		// SECTION Automatic Message Deletion
		if (subCommand === "delete") {
			const channel = interaction.options.getChannel("channel");
			const action = interaction.options.getString("action");

			switch (action) {
				// ANCHOR Add
				case "add":
					if (!channel) {
						interaction.editReply({
							content: "You must specify a channel.",
							ephemeral: true
						});
						return;
					}

					const generalPermissions = [
						"ViewChannel",
						"ReadMessageHistory",
						"ManageMessages"
					];

					// prettier-ignore
					if (await ValidationUtils.insufficientPermissions(interaction, generalPermissions, channel)) return;

					if (
						channel.type !== ChannelType.GuildText &&
						channel.type !== ChannelType.GuildNews
					) {
						interaction.editReply({
							content: "The channel you specified is not a text channel.",
							ephemeral: true
						});
						return;
					}

					if (settings.auto.delete.includes(channel.id)) {
						interaction.editReply({
							content: `Messages in ${channel} are already set to be deleted.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $push: { "auto.delete": channel.id } }
					);

					interaction.editReply({
						content: `Messages in ${channel} will now be deleted.`,
						ephemeral: true
					});

					break;

				// ANCHOR Remove
				case "remove":
					if (!channel) {
						interaction.editReply({
							content: "You must specify a channel.",
							ephemeral: true
						});
						return;
					}

					if (!settings.auto.delete.includes(channel.id)) {
						interaction.editReply({
							content: `Messages in ${channel} are not set to be deleted.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $pull: { "auto.delete": channel.id } }
					);

					interaction.editReply({
						content: `Messages in ${channel} will no longer be deleted.`,
						ephemeral: true
					});

					break;

				// ANCHOR View
				case "view":
					if (settings.auto.delete.length === 0) {
						interaction.editReply({
							content: "There are no channels with automatic message deletion.",
							ephemeral: true
						});
						return;
					}

					const embed = new EmbedBuilder()

						.setColor(config.colors.default)
						.setTitle("Automatic Message Deletion")
						.setFields([
							{
								name: "Channels",
								value: `<#${settings.auto.delete.join("> <#")}>`
							}
						]);

					interaction.editReply({
						embeds: [embed],
						ephemeral: true
					});
			}

			return;
		}
		// !SECTION

		// SECTION Automatic Role Assignment
		if (subCommand === "role") {
			const action = interaction.options.getString("action");
			const role = interaction.options.getRole("role");

			switch (action) {
				// ANCHOR Add
				case "add":
					if (!role) {
						interaction.editReply({
							content: "You must specify a role.",
							ephemeral: true
						});
						return;
					}

					if (!bot.permissions.has("ManageRoles")) {
						interaction.editReply({
							content: "I need the `ManageRoles` permission",
							ephemeral: true
						});
						return;
					}

					if (settings.auto.roles.includes(role.id)) {
						interaction.editReply({
							content: `The ${role} role is already set to be automatically assigned.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $push: { "auto.roles": role.id } }
					);

					interaction.editReply({
						content: `The ${role} role will now be automatically assigned on join.`,
						ephemeral: true
					});

					break;

				// ANCHOR Remove
				case "remove":
					if (!role) {
						interaction.editReply({
							content: "You must specify a role.",
							ephemeral: true
						});
						return;
					}

					if (!settings.auto.roles.includes(role.id)) {
						interaction.editReply({
							content: `The ${role} role is not set to be automatically assigned.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $pull: { "auto.roles": role.id } }
					);

					interaction.editReply({
						content: `The ${role} role will no longer be automatically assigned on join.`,
						ephemeral: true
					});

					break;

				// ANCHOR View
				case "view":
					if (settings.auto.roles.length === 0) {
						interaction.editReply({
							content: "There are no roles with automatic assignment on join.",
							ephemeral: true
						});
						return;
					}

					const embed = new EmbedBuilder()

						.setColor(config.colors.default)
						.setTitle("Automatic Role Assignment")
						.setFields([
							{
								name: "Roles",
								value: `<@&${settings.auto.roles.join("> <@&")}>`
							}
						]);

					interaction.editReply({
						embeds: [embed],
						ephemeral: true
					});
			}

			return;
		}
		// !SECTION
	}
};
