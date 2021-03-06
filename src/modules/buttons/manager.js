const { Collection } = require("discord.js");

const fs = require("fs");
const Guilds = require("./../../db/models/guilds");

/**
 * Manages the loading and execution of buttons
 */
module.exports = class ButtonManager {
	/**
	 * Create a ButtonManager instance
	 * @param {import('../..').Bot} client
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/**
		 * A discord.js Collection (Map) of loaded buttons
		 * @type {Collection<string, import('./button')>}
		 */
		this.buttons = new Collection();
	}

	load() {
		const files = fs.readdirSync("src/buttons").filter(file => file.endsWith(".js"));

		for (let file of files) {
			try {
				file = require(`../../buttons/${file}`);
				// eslint-disable-next-line no-new, new-cap
				new file(this.client);
			} catch (e) {
				log.warn("An error occurred whilst loading a button");
				log.error(e);
			}
		}
	}

	/** Register a button */
	register(button) {
		this.buttons.set(button.custom_id, button);
		log.buttons(`Loaded "${button.custom_id}" button`);
	}

	/**
	 * Execute a button
	 * @param {Interaction} interaction - Button message
	 */
	async handle(interaction) {
		const { isDeveloper, isOwner, isAdministrator, isModerator } = ValidationUtils;

		if (!interaction.guild) {
			return log.debug("Ignoring non-guild button interaction");
		}

		const button = this.buttons.get(interaction.customId);
		if (!button) {
			return;
		}

		const settings = await Guilds.findOne({ id: interaction.guildId });
		await interaction.deferReply({ ephemeral: true });

		// Manage the permission level
		switch (button.permission_level) {
			case 1:
				const moderatorRole = settings.roles.moderator;

				if (!(await isModerator(interaction.member))) {
					if (moderatorRole) {
						interaction.editReply({
							content: `You must have the <@&${moderatorRole}> role to use this button.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `ModerateMembers` permission to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 2:
				const administratorRole = settings.roles.administrator;

				if (!(await isAdministrator(interaction.member))) {
					if (administratorRole) {
						interaction.editReply({
							content: `You must have the <@&${administratorRole}> role to use this button.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `Administrator` permission to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 3:
				if (!(await isOwner(interaction.member))) {
					interaction.editReply({
						content: "You must be the owner of this server to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 4:
				if (!(await isDeveloper(interaction.member.id))) {
					interaction.editReply({
						content: "You must be the developer of the bot to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
		}

		// prettier-ignore
		try {
			log.buttons(`Executing "${button.custom_id}" (${interaction.user.tag} in "${interaction.guild.name}" - ${interaction.guildId})`);
			await button.execute(interaction);
		} catch (error) {
			log.warn(`An error occurred whilst executing the ${button.custom_id} button`);
			log.error(error);
		}
	}
};
