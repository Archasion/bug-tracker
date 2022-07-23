import Command from "../../modules/interactions/commands/Command";
import Properties from "../../data/Properties";
import Bot from "../../Bot";

import { ApplicationCommandType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember } from "discord.js";
import RestrictionUtils, { RestrictionLevel } from "../../utils/RestrictionUtils";

export default class HelpCommand extends Command {
      constructor(client: Bot) {
            super(client, {
                  name: "help",
                  description: "Shows all commands",
                  restriction: RestrictionLevel.Public,
                  type: ApplicationCommandType.ChatInput,
            });
      }

      async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const level = await RestrictionUtils.getRestrictionLevel(interaction.member as GuildMember);
		const commands = this.manager.commands.filter(command => command.restriction <= level);

		const commandList = new EmbedBuilder()
			.setColor(Properties.colors.default as ColorResolvable)
                  .setTitle("Command Guide")
                  .setFields([]);

            for (let i = 0; i <= level; i++) {
                  commandList.data.fields?.push({
                        name: `${RestrictionLevel[i]} Commands`,
                        value: "\u200b"
                  });
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            commands.map(command => commandList.data.fields![command.restriction].value += `**\`/${command.name}\` ·** ${command.description}\n`);
            commandList.data.fields = commandList.data.fields?.filter(field => field.value !== "\u200b");

		await interaction.editReply({
			embeds: [commandList]
            });
            
            return;
      }
}