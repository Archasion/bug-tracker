const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class ServerInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "server-info",
			description: "View information about the server",
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
		const { guild } = interaction;

		let roles = guild.roles.cache.map(role => role).join(" ") || "None";
		if (roles.length > 1024) roles = "Too many roles";

		const bugs = settings.bugs.length;
		const reports = settings.reports.length;
		const suggestions = settings.suggestions.length;

		const info = new EmbedBuilder()
			.setColor(config.colors.default)
			.setTitle(guild.name)
			.setThumbnail(guild.iconURL({ dynamic: true }))
			.setImage(guild.bannerURL({ dynamic: true }))
			.setFooter({ text: `ID: ${guild.id}` })
			.setFields([
				{
					name: "Created",
					value: `<t:${parseInt(guild.createdTimestamp / 1000, 10)}:R>`,
					inline: true
				},
				{
					name: "Members",
					value: guild.memberCount.toString(),
					inline: true
				},
				{
					name: "All Reports",
					value: (bugs + reports + suggestions).toString(),
					inline: true
				},
				{
					name: "Bug Reports",
					value: bugs.toString(),
					inline: true
				},
				{
					name: "Player Reports",
					value: reports.toString(),
					inline: true
				},
				{
					name: "Suggestions",
					value: suggestions.toString(),
					inline: true
				},
				{
					name: "Emojis",
					value: guild.emojis.cache.size.toString(),
					inline: true
				},
				{
					name: "Stickers",
					value: guild.stickers.cache.size.toString(),
					inline: true
				},
				{
					name: "Server Boosts",
					value: guild.premiumSubscriptionCount.toString(),
					inline: true
				},
				{
					name: `Roles (${guild.roles.cache.size})`,
					value: roles,
					inline: true
				}
			]);

		interaction.editReply({
			embeds: [info],
			ephemeral: true
		});
	}
};
