const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

module.exports = class RoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: "role",
			description: "Manage the roles for the bot.",
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
					description: "Set a role configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description: "The type of role to perform the action on",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Moderator",
									value: "moderator"
								},
								{
									name: "Administrator",
									value: "administrator"
								}
							]
						},
						{
							name: "role",
							description: "The role to perform the action on",
							type: Command.option_types.ROLE,
							required: true
						}
					]
				},
				{
					name: "reset",
					description: "Reset a role configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description: "The type of role to perform the action on",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Moderator",
									value: "moderator"
								},
								{
									name: "Administrator",
									value: "administrator"
								}
							]
						}
					]
				},
				{
					name: "view",
					description: "View a role configuration.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description: "The type of role to perform the action on",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Moderator",
									value: "moderator"
								},
								{
									name: "Administrator",
									value: "administrator"
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
		const action = interaction.options.getString("action");
		const role = interaction.options.getRole("role");
		const type = interaction.options.getString("type");

		const dbVariable = `roles.${type}`;

		switch (action) {
			case "set":
				if (!role) {
					interaction.editReply({
						content: "You must specify a role to set.",
						ephemeral: true
					});
					return;
				}

				await Guilds.updateOne(
					{ id: interaction.guildId },
					{ $set: { [dbVariable]: role.id } }
				);

				interaction.editReply({
					content: `The **${type}** role has been set to ${role}.`,
					ephemeral: true
				});

				break;

			case "reset":
				await Guilds.updateOne(
					{ id: interaction.guildId },
					{ $set: { [dbVariable]: null } }
				);

				interaction.editReply({
					content: `The **${type}** role has been reset.`,
					ephemeral: true
				});

				break;

			case "view":
				const settings = await Guilds.findOne({ id: interaction.guildId });
				const roleId = settings.roles[type];

				if (!roleId) {
					interaction.editReply({
						content: `The **${type}** role has not been set.`,
						ephemeral: true
					});
					return;
				}

				interaction.editReply({
					content: `The **${type}** role is set to <@&${roleId}>.`,
					ephemeral: true
				});
		}
	}
};
