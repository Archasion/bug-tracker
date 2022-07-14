const Command = require("../modules/commands/command");
const { EmbedBuilder } = require("discord.js");

module.exports = class RoleInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "role-info",
			description: "View information about a role",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "role",
					description: "The role you want to view",
					type: Command.option_types.ROLE,
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
		const role = interaction.options.getRole("role");
		const permissions = role.permissions.toArray().join("` `") || "None";

		const info = new EmbedBuilder()

			.setColor(role.color)
			.setTitle(role.name)
			.setThumbnail(role.iconURL())
			.setFooter({ text: `ID: ${role.id}` })
			.setFields([
				{
					name: "Created",
					value: `<t:${parseInt(role.createdTimestamp / 1000, 10)}:R>`,
					inline: true
				},
				{
					name: "Color",
					value: role.hexColor,
					inline: true
				},
				{
					name: "Members",
					value: role.members.size.toString(),
					inline: true
				},
				{
					name: "Position",
					value: role.position.toString(),
					inline: true
				},
				{
					name: "Mentionable",
					value: role.mentionable.toString(),
					inline: true
				},
				{
					name: "Hoisted",
					value: role.hoist.toString(),
					inline: true
				},
				{
					name: `Permissions (${role.permissions.toArray().length})`,
					value: `\`${permissions}\``,
					inline: false
				}
			]);

		interaction.editReply({
			embeds: [info],
			ephemeral: true
		});
	}
};
