const { Collection } = require("discord.js");

const fs = require("fs");
const { path } = require("../../utils/fs");

const Guilds = require("./../../mongodb/models/guilds");

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
		const files = fs.readdirSync(path("./src/buttons")).filter(file => file.endsWith(".js"));

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
		if (!interaction.guild) {
			return log.debug("Ignoring non-guild button interaction");
		}

		const button = this.buttons.get(interaction.customId);
		if (!button) {
			return;
		}

		const settings = await Guilds.findOne({ id: interaction.guildId });

		// Manage the permission level
		switch (button.permission_level) {
			case 1:
				const moderatorRole = settings.roles.moderator;

				if (!(await utils.isModerator(interaction.member))) {
					if (moderatorRole) {
						interaction.reply({
							content: `You must have the <@&${moderatorRole}> role to use this button.`,
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: "You must have the `ModerateMembers` permission to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 2:
				const administratorRole = settings.roles.administrator;

				if (!(await utils.isAdministrator(interaction.member))) {
					if (administratorRole) {
						interaction.reply({
							content: `You must have the <@&${administratorRole}> role to use this button.`,
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: "You must have the `Administrator` permission to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 3:
				if (!(await utils.isOwner(interaction.member))) {
					interaction.reply({
						content: "You must be the owner of this server to use this button.",
						ephemeral: true
					});
					return;
				}

				break;
			case 4:
				if (!(await utils.isDeveloper(interaction.member))) {
					interaction.reply({
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
