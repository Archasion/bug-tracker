const Command = require("../modules/commands/command");

module.exports = class PublishCommandsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "publish-commands",
			description: "Force publish slash commands into the server",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "guild_id",
					description: "The guild to publish commands to",
					type: Command.option_types.STRING,
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
		const guildId = interaction.options.getString("guild_id");
		const { client } = this;

		if (interaction.guildId === guildId) {
			interaction.editReply({
				content: "Slash commands have already been published into the server",
				ephemeral: true
			});
			return;
		}

		const guild = client.guilds.cache.get(guildId);

		if (!guild) {
			interaction.editReply({
				content: "Invalid guild ID",
				ephemeral: true
			});
			return;
		}

		if (
			guild.ownerId !== interaction.user.id &&
			!(await ValidationUtils.isDeveloper(interaction.member.id))
		) {
			interaction.editReply({
				content: "You must be the owner of the guild to use this command",
				ephemeral: true
			});
			return;
		}

		client.commands.publish(guild);
		interaction.editReply({
			content: `Tried publishing commands to **${guild.name}** (\`${guild.id}\`), if this did not work, please try to authorize \`application.commands\` through the URL below and use this command again. If the problem still persists, please contact the developer.\n\n**Authorization URL**\nhttps://discord.com/api/oauth2/authorize?client_id=710407168200802384&scope=applications.commands`,
			ephemeral: true
		});
	}
};
