const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class ConfigCommand extends Command {
	constructor(client) {
		super(client, {
			name: "config",
			description: "View the server configuration",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });

		const { channels, roles, bugs, auto, reports, suggestions } = settings;

		const embed = new EmbedBuilder()

			.setColor(config.colors.default)
			.setAuthor({
				name: `${interaction.guild.name}`,
				iconURL: interaction.guild.iconURL({ dynamic: true })
			})
			.setFields([
				{
					name: "Reports/Suggestions",
					value: (bugs.length + reports.length + suggestions.length).toString(),
					inline: true
				},
				{
					name: "Bug Reports Channel",
					value: `${channels.bugs ? `<#${channels.bugs}>` : "None"}`,
					inline: true
				},
				{
					name: "Player Reports Channel",
					value: `${channels.reports ? `<#${channels.reports}>` : "None"}`,
					inline: true
				},
				{
					name: "Suggestions Channel",
					value: `${channels.suggestions ? `<#${channels.suggestions}>` : "None"}`,
					inline: true
				},
				{
					name: "Archive Channel",
					value: `${channels.archive ? `<#${channels.archive}>` : "None"}`,
					inline: true
				},
				{
					name: "Bot Updates Channel",
					value: `${channels.bot_updates ? `<#${channels.bot_updates}>` : "None"}`,
					inline: true
				},
				{
					name: "Auto Threads (Bugs)",
					value: `${auto.threads.bugs ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "Auto Threads (Suggestions)",
					value: `${auto.threads.suggestions ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "DM on Status Change",
					value: `${auto.dm.status ? "Enabled" : "Disabled"}`,
					inline: true
				},
				{
					name: "Auto Role",
					value: `${
						auto.roles.length > 0 ? `<@&${auto.roles.join("> <@&")}>` : "None"
					}`,
					inline: true
				},
				{
					name: "Moderator Role",
					value: `${roles.moderator ? `<@&${roles.moderator}>` : "None"}`,
					inline: true
				},
				{
					name: "Administrator Role",
					value: `${roles.administrator ? `<@&${roles.administrator}>` : "None"}`,
					inline: true
				},
				{
					name: "Automatic Message Deletion",
					value: `${
						auto.delete.length > 0 ? `<#${auto.delete.join("> <#")}>` : "None"
					}`,
					inline: false
				}
			]);

		interaction.editReply({
			embeds: [embed],
			ephemeral: true
		});
	}
};
