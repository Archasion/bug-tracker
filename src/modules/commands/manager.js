const { Collection, EmbedBuilder } = require("discord.js");
const Guilds = require("./../../mongodb/models/guilds");
const Dev = require("./../../mongodb/models/dev");

const fs = require("fs");
const { path } = require("../../utils/fs");

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
		const files = fs.readdirSync(path("./src/commands")).filter(file => file.endsWith(".js"));

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
		if (!guild) {
			return this.client.guilds.cache.forEach(guild => {
				this.publish(guild);
			});
		}

		try {
			const commands = await Promise.all(
				this.client.commands.commands.map(command => command.build(guild))
			);
			await this.client.application.commands.set(commands, guild.id);
			log.success(
				`Published ${this.client.commands.commands.size} commands to "${guild.name}"`
			);
		} catch {
			log.warn("An error occurred whilst publishing the commands");
		}
	}

	/**
	 * Execute a command
	 * @param {Interaction} interaction - Command message
	 */
	async handle(interaction) {
		if (!interaction.guild) {
			return log.debug("Ignoring non-guild command interaction");
		}

		const command = this.commands.get(interaction.commandName);
		if (!command) {
			return;
		}

		const missingPermissions =
			command.permissions instanceof Array &&
			!interaction.member.permissions.has(command.permissions);

		// prettier-ignore
		if (missingPermissions) {
			const perms = command.permissions.map(p => `\`${p}\``).join(", ");
			return interaction.reply({
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
		const blacklist = await Dev.findOne({});

		if (!(await utils.isDeveloper(interaction.member))) {
			for (const blacklistedId of blacklist.guilds) {
				if (interaction.guildId === blacklistedId) {
					interaction.reply({
						content: "This guild is blacklisted from using this bot",
						ephemeral: true
					});
					return;
				}
			}

			for (const blacklistedId of blacklist.roles) {
				if (interaction.member.roles.cache.has(blacklistedId)) {
					interaction.reply({
						content: "Your role is blacklisted from using this bot",
						ephemeral: true
					});
					return;
				}
			}

			for (const blacklistedId of blacklist.users) {
				if (interaction.user.id === blacklistedId) {
					interaction.reply({
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

				if (!(await utils.isModerator(interaction.member))) {
					if (moderatorRole) {
						interaction.reply({
							content: `You must have the <@&${moderatorRole}> role to use this command.`,
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: "You must have the `ModerateMembers` role to use this command.",
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
							content: `You must have the <@&${administratorRole}> role to use this command.`,
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: "You must have the `Administrator` role to use this command.",
						ephemeral: true
					});
					return;
				}

				break;
			case 3:
				if (!(await utils.isOwner(interaction.member))) {
					interaction.reply({
						content: "You must be the owner of this server to use this command.",
						ephemeral: true
					});
					return;
				}

				break;
			case 4:
				if (!(await utils.isDeveloper(interaction.member))) {
					interaction.reply({
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
					return interaction.reply({
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

			await interaction.reply({
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
