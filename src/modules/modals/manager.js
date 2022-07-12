const { Collection } = require("discord.js");

const fs = require("fs");
const { path } = require("../../utils/fs");

const Guilds = require("./../../mongodb/models/guilds");

/**
 * Manages the loading and execution of modals
 */
module.exports = class ModalManager {
	/**
	 * Create a ModalManager instance
	 * @param {import('../..').Bot} client
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/**
		 * A discord.js Collection (Map) of loaded modals
		 * @type {Collection<string, import('./modal')>}
		 */
		this.modals = new Collection();
	}

	load() {
		const files = fs.readdirSync(path("./src/modals")).filter(file => file.endsWith(".js"));

		for (let file of files) {
			try {
				file = require(`../../modals/${file}`);
				// eslint-disable-next-line no-new, new-cap
				new file(this.client);
			} catch (e) {
				log.warn("An error occurred whilst loading a modal");
				log.error(e);
			}
		}
	}

	/** Register a modal */
	register(modal) {
		this.modals.set(modal.custom_id, modal);
		log.modals(
			`Loaded "${
				typeof modal.custom_id === "string"
					? modal.custom_id
					: Object.values(modal.custom_id)[0]
			}" modal`
		);
	}

	/**
	 * Execute a modal
	 * @param {Interaction} interaction - Modal message
	 */
	async handle(interaction) {
		if (!interaction.guild) {
			return log.debug("Ignoring non-guild modal interaction");
		}

		const modal = this.modals.find(m => {
			if (typeof m.custom_id === "string") {
				return m.custom_id === interaction.customId;
			}

			if (m.custom_id.starts_with) {
				return interaction.customId.startsWith(m.custom_id.starts_with);
			}

			if (m.custom_id.ends_with) {
				return interaction.customId.endsWith(m.custom_id.ends_with);
			}

			if (m.custom_id.includes) {
				return interaction.customId.includes(m.custom_id.includes);
			}

			return false;
		});

		if (!modal) {
			return;
		}

		const settings = await Guilds.findOne({ id: interaction.guildId });
		await interaction.deferReply({ ephemeral: true });

		// Manage the permission level
		switch (modal.permission_level) {
			case 1:
				const moderatorRole = settings.roles.moderator;

				if (!(await ValidationUtils.isModerator(interaction.member))) {
					if (moderatorRole) {
						interaction.editReply({
							content: `You must have the <@&${moderatorRole}> role to use this modal.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `ModerateMembers` permission to use this modal.",
						ephemeral: true
					});
					return;
				}

				break;
			case 2:
				const administratorRole = settings.roles.administrator;

				if (!(await ValidationUtils.isAdministrator(interaction.member))) {
					if (administratorRole) {
						interaction.editReply({
							content: `You must have the <@&${administratorRole}> role to use this modal.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `Administrator` permission to use this modal.",
						ephemeral: true
					});
					return;
				}

				break;
			case 3:
				if (!(await ValidationUtils.isOwner(interaction.member))) {
					interaction.editReply({
						content: "You must be the owner of this server to use this modal.",
						ephemeral: true
					});
					return;
				}

				break;
			case 4:
				if (!(await ValidationUtils.isDeveloper(interaction.member.id))) {
					interaction.editReply({
						content: "You must be the developer of the bot to use this modal.",
						ephemeral: true
					});
					return;
				}

				break;
		}

		// prettier-ignore
		try {
			log.modals(
				`Executing "${
					typeof modal.custom_id === "string"
						? modal.custom_id
						: Object.values(modal.custom_id)[0]
				}" (${interaction.user.tag} in "${interaction.guild.name}" - ${interaction.guildId})`
			);

			await modal.execute(interaction);
		} catch (error) {
			log.warn(`An error occurred whilst executing the ${modal.custom_id} modal`);
			log.error(error);
		}
	}
};
