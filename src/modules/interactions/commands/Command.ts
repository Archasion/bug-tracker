import { ApplicationCommandOptionData, ChatInputApplicationCommandData } from "discord.js";
import { RestrictionLevel } from "../../../utils/RestrictionUtils";
import Bot from "../../../Bot";

type CustomApplicationCommandData = ChatInputApplicationCommandData & {
      restriction: RestrictionLevel;
}

export default class Command {
      client: Bot;
      restriction: RestrictionLevel;
      name: string;
      description: string;
      options?: ApplicationCommandOptionData[];

      constructor(client: Bot, data: CustomApplicationCommandData) {
            this.client = client;
            this.restriction = data.restriction;
            this.name = data.name;
            this.description = data.description;
            this.options = data.options ?? [];

            try {
                  this.client.commands.register(this);
            } catch (err) {
                  console.error(err);
                  return;
            }
      }

      build(): ChatInputApplicationCommandData {
            return {
                  name: this.name,
                  description: this.description,
                  options: this.options ?? [],
            }
      }
}

export enum CommandTypes {
      Subcommand = 1,
      SubcommandGroup = 2,
      String = 3,
      Integer = 4,
      Boolean = 5,
      User = 6,
      Channel = 7,
      Role = 8,
      Mentionable = 9,
      Number = 10,
}