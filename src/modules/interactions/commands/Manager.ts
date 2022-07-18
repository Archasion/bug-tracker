import { ApplicationCommandDataResolvable, CommandInteraction, Collection, GuildMember } from "discord.js";
import RestrictionUtils, { RestrictionLevel } from "../../../utils/RestrictionUtils";

import Properties from "../../../data/Properties";
import Command from "./Command";
import Bot from "../../../Bot";
import clc from "cli-color";
import path from "path";
import fs from "fs";

export default class CommandHandler {
      client: Bot;
      commands: Collection<string, any>;

      constructor(client: Bot) {
            this.client = client;
            this.commands = new Collection();
      }

      public async load() {
            const commandFiles = fs.readdirSync(path.join(__dirname, "../../../interactions/commands"))
                  .filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                  const command = require(path.join(__dirname, "../../../interactions/commands", file)).default;
                  new command(this.client);
            }
      }

      public async register(command: Command) {
            this.commands.set(command.name, command);
            console.log(`%s Registered command: "${command.name}"`, Properties.cli.modules.commands);
      }

      public async publish() {
            const commands: ApplicationCommandDataResolvable[] = await Promise.all(
                  this.client.commands.commands.map(command => command.build())
            );

            try {
                  await this.client.application?.commands.set(commands);
                  console.log(clc.green(`(COMMANDS) Successfully loaded ${this.client.commands.commands.size} commands!`));
            } catch (err) {
                  console.error(err);
            }
      }

      public async handle(interaction: CommandInteraction) {
            const command = this.commands.get(interaction.commandName);

            if (!command) {
                  return;
            }

            if (!command.modalResponse) await interaction.deferReply({ ephemeral: true });

            if (!await RestrictionUtils.verifyAccess(command.restriction, interaction.member as GuildMember)) {
                  interaction.editReply({
                        content:
                              `You are **below** the required restriction level for this command: \`${RestrictionLevel[command.restriction]}\`\n`
                              + `Your restriction level: \`${await RestrictionUtils.getRestrictionLevel(interaction.member as GuildMember)}\``,
                  });
                  return;
            }
            
            try {
                  await command.execute(interaction, this.client);
                  console.log(`%s Command "${command.name}" executed by ${interaction.user.tag} %s`, Properties.cli.modules.commands, clc.blackBright(`(guildId: ${interaction.guildId})`));
            } catch (err) {
                  console.log(`Failed to execute command: ${command.name}`);
                  console.error(err);
            }
      }
}