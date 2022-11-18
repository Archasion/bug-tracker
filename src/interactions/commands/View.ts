import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Guild from "../../db/models/Guild.model";
import Bot from "../../Bot";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    ApplicationCommandNumericOptionData,
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

const idOption: ApplicationCommandNumericOptionData[] = [
    {
        name: "id",
        description: "The ID of the bug report.",
        type: ApplicationCommandOptionType.Number,
        required: true
    }
];

export default class ViewCommand extends Command {
    constructor(client: Bot) {
        super(client, {
            name: "view",
            description: "View a submitted report/suggestion.",
            restriction: RestrictionLevel.Public,
            defer: true,
            type: ApplicationCommandType.ChatInput,
            options: [
                {
                    name: "bug_report",
                    description: "View a submitted bug report.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: idOption
                },
                {
                    name: "player_report",
                    description: "View a submitted player report.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: idOption
                },
                {
                    name: "suggestion",
                    description: "View a submitted suggestion.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: idOption
                }
            ]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let type = interaction.options.getSubcommand();
        const id = interaction.options.getNumber("id") as number;

        switch (type) {
            case "bug_report":
                type = "bugReports";
                break;
            case "player_report":
                type = "playerReports";
                break;
            case "suggestion":
                type = "suggestions";
                break;
        }

        const guild = await Guild.findOne(
            {_id: interaction.guildId},
            {[`submissions.${type}`]: 1, _id: 0}
        );

        const submission = guild?.submissions[type][id];

        if (!submission) {
            await interaction.editReply(`There are no submissions of this type with the ID of \`${id}\``);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setThumbnail(interaction.guild?.iconURL() as string | null)
            .setFooter({text: `#${id}`});

        switch (type) {
            case "bugReports": {
                embed.setAuthor({name: `Priority: ${submission.priority}`});
                embed.setFields([
                    {
                        name: "Summary",
                        value: submission.content.summary
                    },
                    {
                        name: "Description",
                        value: submission.content.description
                    }
                ]);

                if (submission.content.reproductionSteps)
                    embed.data.fields?.push({
                        name: "Reproduction Steps",
                        value: submission.content.reproductionSteps
                    });

                if (submission.content.systemSpecs)
                    embed.data.fields?.push({
                        name: "System Specs",
                        value: submission.content.systemSpecs
                    });

                break;
            }

            case "playerReports": {
                embed.setFields([
                    {
                        name: "Reported Player",
                        value: submission.content.reportedPlayer
                    },
                    {
                        name: "Reason",
                        value: submission.content.reason
                    }
                ]);
                break;
            }

            case "suggestions": {
                embed.setTitle("Suggestion");
                embed.setDescription(submission.content);
                break;
            }
        }

        await interaction.editReply({
            content: `<@${submission.authorId}> (\`${submission.authorId}\`)`,
            embeds: [embed]
        });
    }
}