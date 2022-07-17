import { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Collection, Interaction } from "discord.js";
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

      public async handle(interaction: ChatInputCommandInteraction) {
            const command = this.commands.get(interaction.commandName);

            if (!command) {
                  return;
            }
            
            await command.execute(interaction, this.client);
      }
}