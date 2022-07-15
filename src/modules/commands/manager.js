const { Collection, EmbedBuilder } = require("discord.js");
const Guilds = require("./../../db/models/guilds");
const Dev = require("./../../db/models/dev");

const fs = require("fs");

/**
 * Manages the loading and execution of commands
 */
module.exports = class CommandManager {
	/**
	 * Create a CommandManager instance
	 * @param {import('../..').Bot} client
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/**
		 * A discord.js Collection (Map) of loaded commands
		 * @type {Collection<string, import('./command')>}
		 */
		this.commands = new Collection();

		/**
		 * A discord.js Collection (Map) of commands that are on cooldown
		 * @type {Collection<string, import('./command')>}
		 */
		this.cooldowns = new Collection();
	}

	load() {
		const files = fs.readdirSync("src/commands").filter(file => file.endsWith(".js"));

		for (let file of files) {
			try {
				file = require(`../../commands/${file}`);
				// eslint-disable-next-line no-new, new-cap
				new file(this.client);
			} catch (e) {
				log.warn("An error occurred whilst loading a command");
				log.error(e);
			}
		}
	}

	/** Register a command */
	register(command) {
		this.commands.set(command.name, command);
		log.commands(`Loaded "${command.name}" command`);
	}

	async publish(guild) {
		const commands = await Promise.all(
			this.client.commands.commands.map(command => command.build(guild))
		);

		if (!guild) {
			try {
				await this.client.application.commands.set(commands);
				log.success("Successfully PUBLISHED global commands");
				return;
			} catch {
				log.error("Failed to PUBLISH global commands");
			}
		}

		try {
			await this.client.application.commands.set(commands, guild.id);
			log.success(
				`PUBLISHED ${this.client.commands.commands.size} commands to "${guild.name}"`
			);
		} catch {
			log.warn(`An error occurred whilst PUBLISHING commands in "${guild.name}"`);
		}
	}

	async remove(guildId, guildName = "Unknown Guild") {
		if (!guildId) {
			try {
				this.client.application.commands.set([]);
				log.error("Successfully DELETED global commands");

				return;
			} catch {
				log.warn("Failed to DELETE global commands");
			}
		}

		try {
			this.client.application.commands.set([], guildId);
			log.error(`DELETED all commands from "${guildName}"`);
		} catch {
			log.warn(`An error occurred whilst DELETING commands in "${guildName}"`);
		}
	}

	/**
	 * Execute a command
	 * @param {Interaction} interaction - Command message
	 */
	async handle(interaction) {
		const { isDeveloper, isOwner, isAdministrator, isModerator } = ValidationUtils;

		const command = this.commands.get(interaction.commandName);
		if (!command) {
			return;
		}

		if (!interaction.inGuild()) {
			interaction.reply({ content: "Commands are unavailable in DMs.", ephemeral: true });
			return;
		}

		if (!command.has_modal) await interaction.deferReply({ ephemeral: true });

		const missingPermissions =
			command.permissions instanceof Array &&
			!interaction.member.permissions.has(command.permissions);

		// prettier-ignore
		if (missingPermissions) {
			const perms = command.permissions.map(p => `\`${p}\``).join(", ");
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.error)
						.setTitle("Error")
						.setDescription(`You do not have the permissions required to use this command:\n${perms}`)
				],
				ephemeral: true
			});
		}

		const settings = await Guilds.findOne({ id: interaction.guildId });

		// Manage the blacklist
		const { blacklist } = await Dev.findOne({});

		if (!(await isDeveloper(interaction.member.id))) {
			for (const blacklistedId of blacklist.guilds) {
				if (interaction.guildId === blacklistedId) {
					interaction.editReply({
						content: "This guild is blacklisted from using this bot",
						ephemeral: true
					});
					return;
				}
			}

			for (const blacklistedId of blacklist.roles) {
				if (interaction.member.roles.cache.has(blacklistedId)) {
					interaction.editReply({
						content: "Your role is blacklisted from using this bot",
						ephemeral: true
					});
					return;
				}
			}

			for (const blacklistedId of blacklist.users) {
				if (interaction.user.id === blacklistedId) {
					interaction.editReply({
						content: "You are blacklisted from using this bot",
						ephemeral: true
					});
					return;
				}
			}
		}

		// Manage the permission level
		switch (command.permission_level) {
			case 1:
				const moderatorRole = settings.roles.moderator;

				if (!(await isModerator(interaction.member))) {
					if (moderatorRole) {
						interaction.editReply({
							content: `You must have the <@&${moderatorRole}> role to use this command.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `ModerateMembers` permission to use this command.",
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
							content: `You must have the <@&${administratorRole}> role to use this command.`,
							ephemeral: true
						});
						return;
					}

					interaction.editReply({
						content: "You must have the `Administrator` permission to use this command.",
						ephemeral: true
					});
					return;
				}

				break;
			case 3:
				if (!(await isOwner(interaction.member))) {
					interaction.editReply({
						content: "You must be the owner of this server to use this command.",
						ephemeral: true
					});
					return;
				}

				break;
			case 4:
				if (!(await isDeveloper(interaction.member.id))) {
					interaction.editReply({
						content: "You must be the developer of the bot to use this command.",
						ephemeral: true
					});
					return;
				}

				break;
		}

		if (command.cooldown) {
			if (!this.cooldowns.has(command.name)) {
				this.cooldowns.set(command.name, new Collection());
			}

			const currentTime = Date.now();
			const timestamps = this.cooldowns.get(command.name);
			const cooldownTime = command.cooldown * 1000; // Cooldowns are provided in seconds, converted to milliseconds

			if (timestamps.has(interaction.channelId)) {
				const expiration_time = timestamps.get(interaction.channelId) + cooldownTime;

				if (currentTime < expiration_time) {
					const time_left = (expiration_time - currentTime) / 1000;
					const cooldownTimeMinutes = Math.trunc(cooldownTime / 60000);
					return interaction.editReply({
						content: `The command has already been used by someone less than ${cooldownTimeMinutes} minute${
							cooldownTimeMinutes > 1 ? "s" : ""
						} ago. Try again in ${time_left.toFixed(1)} seconds.`,
						ephemeral: true
					});
				}
			}

			timestamps.set(interaction.channelId, currentTime);
			setTimeout(() => {
				timestamps.delete(interaction.channelId);
			}, cooldownTime);
		}

		// prettier-ignore
		try {
			log.commands(`Executing "${command.name}" (${interaction.user.tag} in "${interaction.guild.name}" - ${interaction.guildId})`);
			await command.execute(interaction);
		} catch (error) {
			log.warn(`An error occurred whilst executing the ${command.name} command`);
			log.error(error);

			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(config.colors.error)
						.setTitle("⚠️")
						.setDescription("An unexpected error occurred during command execution.\nPlease ask an administrator to check the console output / logs for details.")
				],
				ephemeral: true
			});
		}
	}
};
