/**
 * A command
 */
module.exports = class Command {
	/**
	 *
	 * @typedef CommandOption
	 * @property {string} name - The option's name
	 * @property {number} type - The option's type (use `Command.option_types`)
	 * @property {string} description - The option's description
	 * @property {CommandOption[]} [options] - The option's options
	 * @property {(string|number)[]} [choices] - The option's choices
	 * @property {boolean} [required] - Is this arg required? Defaults to `false`
	 */
	/**
	 * Create a new Command
	 * @param {import('../../').Bot} client - The Discord Client
	 * @param {Object} data - Command data
	 * @param {string} data.name - The name of the command (3-32)
	 * @param {string} data.description - The description of the command (1-100)
	 * @param {number} [data.permission_level] - Restrict the command to certain permission levels
	 * @param {string[]} [data.permissions] - Array of permissions needed for a user to use this command
	 * @param {number} [data.cooldown] - The wait period (in seconds) to run the command again
	 * @param {CommandOption[]} [data.options] - The command's options
	 * @param {string[]} [data.ignored] - Array of items to ignore
	 */
	constructor(client, data) {
		/** The Discord Client */
		this.client = client;

		/** The CommandManager */
		this.manager = this.client.commands;

		if (typeof data !== "object") {
			throw new TypeError(
				`Expected type of command "data" to be an object, got "${typeof data}"`
			);
		}

		/**
		 * The name of the command
		 * @type {string}
		 */
		this.name = data.name;

		/**
		 * The command description
		 * @type {string}
		 */
		this.description = data.description;

		/**
		 * Restrict the command to certain permission levels
		 * @type {number}
		 */
		this.permission_level = data.permission_level;

		/**
		 * Array of permissions needed for a user to use this command
		 * @type {string[]}
		 */
		this.permissions = data.permissions ?? [];

		/**
		 * The wait period (in seconds) to run the command again
		 * @type {number}
		 */
		this.cooldown = data.cooldown;

		/**
		 * Don't allow command use in channel x (can be used by moderators+)
		 * @type {number}
		 */
		this.ignored = data.ignored;

		/**
		 * Whether the command has a modal response
		 * @type {number}
		 */
		this.has_modal = data.has_modal;

		/**
		 * The command options
		 * @type {CommandOption[]}
		 */
		this.options = data.options ?? [];

		try {
			this.manager.register(this); // Register the command
		} catch (error) {
			log.error(error);
			return;
		}
	}

	async build(guild) {
		return {
			defaultPermission: !this.moderator_only,
			description: this.description,
			name: this.name,
			options: typeof this.options === "function" ? await this.options(guild) : this.options
		};
	}

	static get option_types() {
		return {
			SUB_COMMAND: 1,
			SUB_COMMAND_GROUP: 2,
			STRING: 3,
			INTEGER: 4,
			BOOLEAN: 5,
			USER: 6,
			CHANNEL: 7,
			ROLE: 8,
			MENTIONABLE: 9,
			NUMBER: 10
		};
	}

	static get types() {
		return {
			SLASH_COMMAND: 1,
			USER_COMMAND: 2,
			MESSAGE_COMMAND: 3
		};
	}
};
