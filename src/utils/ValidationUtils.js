const Guilds = require("../db/models/guilds");

module.exports = class ValidationUtils {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Check if the bot has the required permissions
	 * @param {string} clientId - the ID of the bot
	 * @param {Interaction} interaction - the interaction
	 * @param {TextChannel} channel - the channel to check permissions in
	 * @param {Array<PermissionResolvable>} permissions - the required permissions
	 * @returns {boolean}
	 */
	async insufficientPermissions(clientId, interaction, permissions, channel = interaction.channel) {
		const bot = await interaction.guild.members.fetch(clientId);

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
	 * Check if a channel is a bot support channel
	 * @param {string} channelId - the ID of the channel
	 * @returns {boolean}
	 */
	async isSupportChannel(channelId) {
		return Object.values(config.channels.bot).includes(channelId);
	}

	/**
	 * Check if a guild member is a developer
	 * @param {string} memberId - the ID of the member
	 * @returns {boolean}
	 */
	async isDeveloper(memberId) {
		return config.users.developers.includes(memberId);
	}
};
