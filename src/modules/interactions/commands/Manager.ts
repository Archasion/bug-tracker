import { ApplicationCommandDataResolvable, CommandInteraction, Collection, GuildMember } from "discord.js";
import RestrictionUtils, { RestrictionLevel } from "../../../utils/RestrictionUtils";

import Command from "./Command";
import Bot from "../../../Bot";
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
            console.log(`Registered command: "${command.name}"`);
      }

      public async publish() {
            const commands: ApplicationCommandDataResolvable[] = await Promise.all(
                  this.client.commands.commands.map(command => command.build())
            );

            try {
                  await this.client.application?.commands.set(commands);
                  console.log(`Successfully loaded ${this.client.commands.commands.size} commands!`);
            } catch (err) {
                  console.error(err);
            }
      }

      public async handle(interaction: CommandInteraction) {
            const command = this.commands.get(interaction.commandName);

            if (!command) {
                  return;
            }

            if (!await RestrictionUtils.verifyAccess(command.restriction, interaction.member as GuildMember)) {
                  interaction.reply({
                        content:
                              `You are **below** the required restriction level for this command: \`${RestrictionLevel[command.restriction]}\`\n`
                              + `Your restriction level: \`${await RestrictionUtils.getRestrictionLevel(interaction.member as GuildMember)}\``,
                        
                        ephemeral: true
                  });
                  return;
            }
            
            try {
                  await command.execute(interaction, this.client);
            } catch (err) {
                  console.log(`Failed to execute command: ${command.name}`);
                  console.error(err);
            }
      }
}