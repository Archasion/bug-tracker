import { ApplicationCommandOptionData, ChatInputApplicationCommandData } from "discord.js";
import { RestrictionLevel } from "../../../utils/RestrictionUtils";

import CommandHandler from "./Manager";
import Bot from "../../../Bot";

type CustomApplicationCommandData = ChatInputApplicationCommandData & {
      restriction: RestrictionLevel;
      modalResponse?: boolean;
}

export default class Command {
      client: Bot;
      manager: CommandHandler;
      restriction: RestrictionLevel;
      modalResponse: boolean;
      name: string;
      description: string;
      options?: ApplicationCommandOptionData[];

      constructor(client: Bot, data: CustomApplicationCommandData) {
            this.client = client;
            this.manager = client.commands;
            this.restriction = data.restriction;
            this.modalResponse = data.modalResponse ?? false;
            this.name = data.name;
            this.description = data.description;
            this.options = data.options ?? [];

            try {
                  // noinspection JSIgnoredPromiseFromCall
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
            };
      }
}