const Command = require("../modules/commands/command");

const { isModerator, isAdministrator, isOwner, isDeveloper } = ValidationUtils;
const { EmbedBuilder } = require("discord.js");

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			description: "List the commands you have access to",
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
		// Check the user's rank
		const moderator = await isModerator(interaction.member);
		const administrator = await isAdministrator(interaction.member);
		const owner = await isOwner(interaction.member);
		const developer = await isDeveloper(interaction.member.id);

		const commands = this.manager.commands.filter(command => {
			// Validate the user's permissions
			if (command.permissions.length > 0) {
				return interaction.member.permissions.has(command.permissions);
			}

			if (command.permission_level === 0) return true;

			// Validate the user's rank
			if (
				(command.permission_level === 1 && moderator) ||
				(command.permission_level === 2 && administrator) ||
				(command.permission_level === 3 && owner) ||
				(command.permission_level === 4 && developer)
			)
				return true;

			return false;
		});

		const commandList = new EmbedBuilder()
			.setColor(config.colors.default)
			.setTitle("Command Guide")
			.setFields([
				{
					name: "Public Commands",
					value: "N/A"
				},
				{
					name: "Moderator Commands",
					value: "N/A"
				},
				{
					name: "Administrator Commands",
					value: "N/A"
				},
				{
					name: "Owner Commands",
					value: "N/A"
				},
				{
					name: "Developer Commands",
					value: "N/A"
				}
			]);

		// Create a list of commands the user has access to
		// prettier-ignore
		commands.map(command => commandList.data.fields[command.permission_level].value += `**\`/${command.name}\` ??** ${command.description}\n`);

		commandList.data.fields = commandList.data.fields.filter(field => field.value !== "N/A");

		commandList.data.fields.forEach(field => (field.value = field.value.replace("N/A", "")));

		// Respond with the list of commands
		await interaction.editReply({
			embeds: [commandList],
			ephemeral: true
		});
	}
};
