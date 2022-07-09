const EventListener = require("../modules/listeners/listener");
const { InteractionType } = require("discord.js");

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "interactionCreate" });
	}

	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		// ANCHOR Slash Commands
		if (interaction.type === InteractionType.ApplicationCommand) {
			this.client.commands.handle(interaction);
		}

		// ANCHOR Buttons
		else if (interaction.type === InteractionType.MessageComponent) {
			this.client.buttons.handle(interaction);
		}

		// ANCHOR Modals
		else if (interaction.type === InteractionType.ModalSubmit) {
			this.client.modals.handle(interaction);
		}
	}
};
