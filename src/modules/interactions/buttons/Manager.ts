import { Collection, GuildMember, ButtonInteraction } from "discord.js";
import RestrictionUtils, { RestrictionLevel } from "../../../utils/RestrictionUtils";

import Properties from "../../../data/Properties";
import Button from "./Button";
import Bot from "../../../Bot";
import clc from "cli-color";
import path from "path";
import fs from "fs";

export default class CommandHandler {
      client: Bot;
      buttons: Collection<string, any>;

      constructor(client: Bot) {
            this.client = client;
            this.buttons = new Collection();
      }

      public async load() {
            const files = fs.readdirSync(path.join(__dirname, "../../../interactions/buttons"))
                  .filter(file => file.endsWith(".js"));

            for (const file of files) {
                  const button = require(path.join(__dirname, "../../../interactions/buttons", file)).default;
                  new button(this.client);
            }
      }

      public async register(button: Button) {
            this.buttons.set(button.name, button);
            console.log(`%s Registered command: "${button.name}"`, Properties.cli.modules.buttons);
      }

      public async handle(interaction: ButtonInteraction) {
            const button = this.buttons.get(interaction.customId);

            if (!button) {
                  return;
            }

            if (!button.modalResponse) await interaction.deferReply({ ephemeral: true });

            if (!await RestrictionUtils.verifyAccess(button.restriction, interaction.member as GuildMember)) {
                  interaction.editReply({
                        content:
                              `You are **below** the required restriction level for this button: \`${RestrictionLevel[button.restriction]}\`\n`
                              + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
                  });
                  return;
            }
            
            try {
                  await button.execute(interaction, this.client);
                  console.log(`%s "${button.name}" executed by ${interaction.user.tag} %s`, Properties.cli.modules.buttons, clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
            } catch (err) {
                  console.log(`Failed to execute button: ${button.name}`);
                  console.error(err);
            }
      }
}