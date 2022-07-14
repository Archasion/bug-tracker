const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "user-info",
			description: "View information about a user",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "user",
					description: "The user you want to view",
					type: Command.option_types.USER,
					required: true
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const member = interaction.options.getMember("user");

		let bugs = 0;
		settings.bugs.forEach(bug => {
			if (bug.author === member.id) bugs++;
		});

		let reports = 0;
		settings.reports.forEach(report => {
			if (report.author === member.id) reports++;
		});

		let suggestions = 0;
		settings.suggestions.forEach(suggestion => {
			if (suggestion.author === member.id) suggestions++;
		});

		await member.user.fetch({ force: true });

		const permissions = member.permissions.toArray().join("` `") || "None";
		const roles = member.roles.cache.map(role => role).join(" ") || "None";

		const info = new EmbedBuilder()
			.setColor(config.colors.default)
			.setTitle(member.displayName)
			.setThumbnail(member.displayAvatarURL({ dynamic: true }))
			.setImage(member.user.bannerURL({ dynamic: true }))
			.setFooter({ text: `ID: ${member.id}` })
			.setAuthor({
				name: member.user.tag,
				iconURL: member.user.displayAvatarURL({ dynamic: true })
			})
			.setFields([
				{
					name: "Created",
					value: `<t:${parseInt(member.user.createdTimestamp / 1000, 10)}:R>`,
					inline: true
				},
				{
					name: "Joined",
					value: `<t:${parseInt(member.joinedTimestamp / 1000, 10)}:R>`,
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
					name: `Roles (${member._roles.length})`,
					value: roles,
					inline: false
				},
				{
					name: `Permissions (${member.permissions.toArray().length})`,
					value: `\`${permissions}\``,
					inline: false
				}
			]);

		const avatarButton = new ButtonBuilder({})
			.setLabel("Avatar")
			.setStyle(ButtonStyle.Link)
			.setURL(member.displayAvatarURL({ dynamic: true }));

		const actionRow = new ActionRowBuilder().addComponents([avatarButton]);

		interaction.editReply({
			content: `${member}`,
			embeds: [info],
			components: [actionRow],
			ephemeral: true
		});
	}
};
