const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = class BotInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "bot-info",
			description: "View info about the bot",
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
		const bot = await interaction.guild.members.fetch(this.client.user.id);
		const permissions = bot.permissions.toArray().join("` `") || "None";
		const { client } = this;

		interaction.deferReply({ ephemeral: true });

		let memberCount = 0;
		client.guilds.cache.forEach(guild => {
			memberCount += guild.memberCount;
		});

		const bugs = await Guilds.find({ bugs: { $ne: [] } });
		const reports = await Guilds.find({ reports: { $ne: [] } });
		const suggestions = await Guilds.find({ busuggestionsgs: { $ne: [] } });

		let bugCount = 0;
		let reportCount = 0;
		let suggestionCount = 0;

		for (const item of bugs) bugCount += item.bugs.length;
		for (const item of reports) reportCount += item.reports.length;
		for (const item of suggestions) suggestionCount += item.suggestions.length;

		const info = new EmbedBuilder()

			.setColor(config.colors.default)
			.setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
			.setFields([
				{
					name: "Created",
					value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Joined",
					value: `<t:${parseInt(bot.joinedTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Started",
					value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Guilds",
					value: client.guilds.cache.size.toString(),
					inline: true
				},
				{
					name: "Channels",
					value: client.channels.cache.size.toString(),
					inline: true
				},
				{
					name: "Members",
					value: memberCount.toString(),
					inline: true
				},
				{
					name: "Bug Reports",
					value: bugCount.toString(),
					inline: true
				},
				{
					name: "Player Reports",
					value: reportCount.toString(),
					inline: true
				},
				{
					name: "Suggestions",
					value: suggestionCount.toString(),
					inline: true
				},
				{
					name: `Permissions (${bot.permissions.toArray().length})`,
					value: `\`${permissions}\``,
					inline: false
				}
			]);

		const githubButton = new ButtonBuilder({})

			.setLabel("GitHub")
			.setStyle(ButtonStyle.Link)
			.setURL("https://github.com/Archasion/bug-tracker");

		const supportButton = new ButtonBuilder({})

			.setLabel("Support")
			.setStyle(ButtonStyle.Link)
			.setURL("https://discord.gg/bTR5qBG");

		// prettier-ignore
		const inviteButton = new ButtonBuilder({})

			.setLabel("Invite")
			.setStyle(ButtonStyle.Link)
			.setURL(
				`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=51539954752`
			);

		const voteButton = new ButtonBuilder({})

			.setLabel("Vote")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://top.gg/bot/${client.user.id}`);

		const actionRow = new ActionRowBuilder().addComponents([
			githubButton,
			supportButton,
			inviteButton,
			voteButton
		]);

		interaction.editReply({
			embeds: [info],
			components: [actionRow],
			ephemeral: true
		});
	}
};
