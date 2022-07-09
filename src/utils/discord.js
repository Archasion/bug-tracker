const Guilds = require("../mongodb/models/guilds");

module.exports = class DiscordUtils {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Check if the bot has the required permissions
	 * @param {Interaction} interaction - the interaction
	 * @param {Array} permissions - the required permissions
	 * @returns {boolean}
	 */
	async insufficientPermissions(interaction, permissions, channel = interaction.channel) {
		const bot = await interaction.guild.members.fetch(this.client.user.id);

		const missingPermissions = permissions.filter(
			permission => !bot.permissionsIn(channel).has(permission)
		);

		// prettier-ignore
		if (missingPermissions[0]) {
			interaction.editReply({
				content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
				ephemeral: true,
			});
			return true;
		}

		return false;
	}

	/**
	 * Check if a guild member is able to moderate members
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isModerator(member) {
		const settings = await Guilds.findOne({ id: member.guild.id });

		const administratorRole = settings.roles.administrator;
		const moderatorRole = settings.roles.moderator;

		if (administratorRole) {
			if (member.roles.cache.has(administratorRole)) return true;
		} else if (member.permissions.has("Administrator")) return true;

		if (moderatorRole) {
			if (member.roles.cache.has(moderatorRole)) return true;
		} else if (member.permissions.has("ModerateMembers")) return true;

		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is an administrator
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isAdministrator(member) {
		const settings = await Guilds.findOne({ id: member.guild.id });
		const administratorRole = settings.roles.administrator;

		if (administratorRole) {
			if (member.roles.cache.has(administratorRole)) return true;
		} else if (member.permissions.has("Administrator")) return true;

		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is the owner
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isOwner(member) {
		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is a developer
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isDeveloper(member) {
		return config.users.developers.includes(member.id);
	}
};
