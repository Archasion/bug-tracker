import Command from "../../modules/interactions/commands/Command";
import Guilds from "../../db/models/Guilds";
import Bot from "../../Bot";

import { ApplicationCommandChoicesData, ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { RestrictionLevel } from "../../utils/RestrictionUtils";

const roleType: ApplicationCommandChoicesData = {
      name: "type",
      description: "The rank to configure the role for.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
            {
                  name: "Reviewer",
                  value: "reviewer"
            },
            {
                  name: "Moderator",
                  value: "moderator"
            },
            {
                  name: "Administrator",
                  value: "administrator"
            }
      ]
};

export default class RoleCommand extends Command {
	constructor(client: Bot) {
		super(client, {
			name: "role",
			description: "Manage the roles configured for the bot.",
			restriction: RestrictionLevel.Administrator,
			options: [
                        {
                              name: "set",
					description: "Allow a role to perform certain tasks.",
                              type: ApplicationCommandOptionType.Subcommand,
                              options: [
                                    roleType,
                                    {
                                          name: "role",
                                          description: "The role to set for the rank.",
                                          type: ApplicationCommandOptionType.Role,
                                          required: true
                                    }
                              ]
				},
                        {
                              name: "view",
					description: "View the configured role for certain ranks.",
                              type: ApplicationCommandOptionType.Subcommand,
                              options: [roleType]
				},
                        {
                              name: "reset",
					description: "Remove a role configuration.",
                              type: ApplicationCommandOptionType.Subcommand,
                              options: [roleType]
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
      async execute(interaction: ChatInputCommandInteraction): Promise<void> {    
            const action = interaction.options.getSubcommand();
		const type = interaction.options.getString("type") as string;

            switch (action) {
                  case "set":
                        const role = interaction.options.getRole("role");

                        await Guilds.updateOne({ id: interaction.guildId }, { $set: { [`roles.${type}`]: role!.id } });
                        interaction.editReply(`The **${type}** role has been set to ${role}.`);
                        break;

                  case "reset":
                        await Guilds.updateOne({ id: interaction.guildId }, { $set: { [`roles.${type}`]: null } });
                        interaction.editReply(`The **${type}** role has been reset.`);
                        break;

                  case "view":
                        const guildConfig = await Guilds.findOne({ id: interaction.guildId }, { roles: 1, _id: 0 }) as any;
                        const roleId = guildConfig.roles[type];

                        if (!roleId) {
                              interaction.editReply(`There is no role set for this rank.\nYou can set one using \`/role set\``);
                              return;
                        }

                        interaction.editReply(`The **${type.replace(/_/g, " ")}** role is set to <@&${roleId}>.`);
                        break;
            }

            return;
	}
};