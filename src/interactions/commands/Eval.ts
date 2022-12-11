import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";

import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    ApplicationCommandType,
    EmbedBuilder,
    Client
} from "discord.js";

import {RestrictionLevel} from "../../utils/RestrictionUtils";

export default class EvalCommand extends Command {
    constructor(client: Client) {
        super(client, {
            name: "eval",
            description: "Evaluate code.",
            restriction: RestrictionLevel.Developer,
            type: ApplicationCommandType.ChatInput,
            defer: true,
            options: [{
                name: "code",
                description: "The code to evaluate.",
                required: true,
                type: ApplicationCommandOptionType.String
            }]
        });
    }

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const codeToEvaluate = interaction.options.getString("code") as string;

        const embed = new EmbedBuilder()
            .setColor(Properties.colors.default)
            .setTitle("Evaluated code");

        try {
            let evaluatedCode = eval(codeToEvaluate);

            if (typeof evaluatedCode === "object")
                evaluatedCode = JSON.stringify(evaluatedCode, null, "\t");

            if (
                typeof evaluatedCode !== "string" &&
                typeof evaluatedCode !== "number" &&
                typeof evaluatedCode !== "boolean"
            ) {
                await interaction.editReply(`The output could not be converted to text (output type: ${typeof evaluatedCode})`);
                return;
            }

            embed.setDescription(`\`\`\`ts\n${evaluatedCode}\n\`\`\``);
        } catch (error) {
            embed.setTitle("Failed to evaluate code");
            embed.setDescription(`\`\`\`ts\n${error}\n\`\`\``);
        }

        await interaction.editReply({embeds: [embed]});
        return;
    }
}