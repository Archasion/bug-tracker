const Command = require("../modules/commands/command");
const Dev = require("../db/models/dev");

module.exports = class BlacklistCommand extends Command {
	constructor(client) {
		super(client, {
			name: "blacklist",
			description: "Blacklist certain servers/roles/users from using the bot",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			permissions: [],
			options: [
				{
					name: "add",
					description: "Add to blacklist.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description: "The item to blacklist",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Guild",
									value: "guilds"
								},
								{
									name: "Role",
									value: "roles"
								},
								{
									name: "User",
									value: "users"
								}
							]
						},
						{
							name: "id",
							description: "The id of the item to blacklist",
							type: Command.option_types.STRING,
							required: true
						}
					]
				},
				{
					name: "remove",
					description: "Remove from blacklist.",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description: "The item to blacklist",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Guild",
									value: "guilds"
								},
								{
									name: "Role",
									value: "roles"
								},
								{
									name: "User",
									value: "users"
								}
							]
						},
						{
							name: "id",
							description: "The id of the item to blacklist",
							type: Command.option_types.STRING,
							required: true
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
		const id = interaction.options.getString("id");

		const { blacklist } = await Dev.findOne({});

		if (action === "remove") {
			if (!blacklist[type].includes(id)) {
				interaction.editReply({
					content: `The ${type.slice(0, -1)} is not blacklisted`,
					ephemeral: true
				});
				return;
			}

			const item = `blacklist.${type}`;

			await Dev.updateOne({}, { $pull: { [item]: id } }).then(() => {
				interaction.editReply({
					content: `The ${type.slice(0, -1)} has been removed from the blacklist`,
					ephemeral: true
				});
			});
		}

		if (action === "add") {
			if (blacklist[type].includes(id)) {
				interaction.editReply({
					content: `The ${type.slice(0, -1)} is already blacklisted`,
					ephemeral: true
				});
				return;
			}

			const item = `blacklist.${type}`;

			await Dev.updateOne({}, { $push: { [item]: id } }).then(() => {
				interaction.editReply({
					content: `The ${type.slice(0, -1)} has been added to the blacklist`,
					ephemeral: true
				});
			});
		}
	}
};
