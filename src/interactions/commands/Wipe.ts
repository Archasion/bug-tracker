import Command from "../../modules/interactions/commands/Command";
import Guild from "../../database/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class WipeCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "wipe",
            description: "Wipe certain/all data from the database",
            restriction: RestrictionLevel.Owner,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [
                {
                    name: "type",
                    description: "The data you want to wipe",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "Bug Reports",
                            value: "bug"
                        },
                        {
                            name: "Player Reports",
                            value: "report"
                        },
                        {
                            name: "Suggestions",
                            value: "suggestion"
                        },
                        {
                            name: "Channel Configuration",
                            value: "channel"
                        },
                        {
                            name: "Role Configuration",
                            value: "role"
                        },
                        {
                            name: "Settings",
                            value: "settings"
                        },
                        {
                            name: "Everything",
                            value: "all"
                        }
                    ]
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const type = interaction.options.getString("type");
        const isType = (typeInput: string) => type === typeInput || type === "all";

        if (isType("bug")) await Guild.updateOne({_id: interaction.guildId}, {$set: {["submissions.bugReports"]: []}});
        if (isType("report")) await Guild.updateOne({_id: interaction.guildId}, {$set: {["submissions.playerReports"]: []}});
        if (isType("suggestion")) await Guild.updateOne({_id: interaction.guildId}, {$set: {["submissions.suggestions"]: []}});

        if (isType("channel")) {
            await Guild.updateOne(
                {_id: interaction.guildId},
                {
                    $set: {
                        channels: {
                            bugReports: null,
                            playerReports: null,
                            suggestions: null,
                            archive: {
                                bugReports: null,
                                playerReports: null,
                                suggestions: null
                            },
                            botUpdates: null
                        }
                    }
                }
            );
        }

        if (isType("role")) {
            await Guild.updateOne(
                {_id: interaction.guildId},
                {
                    $set: {
                        roles: {
                            reviewer: null,
                            admin: null
                        }
                    }
                }
            );
        }

        if (isType("settings")) {
            await Guild.updateOne(
                {_id: interaction.guildId},
                {
                    $set: {
                        settings: {
                            autoRoles: [],
                            autoDelete: [],
                            notifyOnStatusChange: false,
                            threads: {
                                bugReports: false,
                                suggestions: false
                            }
                        }
                    }
                }
            );
        }

        await interaction.editReply(`Successfully wiped all${type !== "all" ? ` ${type}` : ""} data from the database!`);
        return;
    }
}