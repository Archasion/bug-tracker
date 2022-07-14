const Command = require("../modules/commands/command");
const Guilds = require("../db/models/guilds");

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { addCommas } = FormattingUtils;

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

		const stats = await Guilds.aggregate([
			{
				$group: {
					_id: null,
					bugCount: { $sum: { $size: "$bugs" } },
					reportCount: { $sum: { $size: "$reports" } },
					suggestionCount: { $sum: { $size: "$suggestions" } }
				}
			}
		]);

		const { bugCount, reportCount, suggestionCount } = stats[0];

		let memberCount = 0;
		client.guilds.cache.forEach(guild => {
			memberCount += guild.memberCount;
		});

		const info = new EmbedBuilder()

			.setColor(config.colors.default)
			.setAuthor({
				name: client.user.tag,
				iconURL: client.user.displayAvatarURL({ dynamic: true })
			})
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
					value: addCommas(client.guilds.cache.size),
					inline: true
				},
				{
					name: "Channels",
					value: addCommas(client.channels.cache.size),
					inline: true
				},
				{
					name: "Members",
					value: addCommas(memberCount),
					inline: true
				},
				{
					name: "Bug Reports",
					value: addCommas(bugCount),
					inline: true
				},
				{
					name: "Player Reports",
					value: addCommas(reportCount),
					inline: true
				},
				{
					name: "Suggestions",
					value: addCommas(suggestionCount),
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
