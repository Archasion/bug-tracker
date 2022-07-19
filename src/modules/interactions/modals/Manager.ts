import { Collection, GuildMember, ModalSubmitInteraction } from "discord.js";
import RestrictionUtils, { RestrictionLevel } from "../../../utils/RestrictionUtils";

import Properties from "../../../data/Properties";
import Bot from "../../../Bot";
import Modal from "./Modal";
import clc from "cli-color";
import path from "path";
import fs from "fs";

export default class CommandHandler {
      client: Bot;
      modals: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, any>;

      constructor(client: Bot) {
            this.client = client;
            this.modals = new Collection();
      }

      public async load() {
            const files = fs.readdirSync(path.join(__dirname, "../../../interactions/modals"))
                  .filter(file => file.endsWith(".js"));

            for (const file of files) {
                  const modal = require(path.join(__dirname, "../../../interactions/modals", file)).default;
                  new modal(this.client);
            }
      }

      public async register(modal: Modal) {
            this.modals.set(modal.name, modal);

            const modalName = typeof modal.name === "string" ?
                  modal.name :
                  Object.values(modal.name)[0];

            console.log(`%s Registered command: "${modalName}"`, Properties.cli.modules.modals);
      }

      public async handle(interaction: ModalSubmitInteraction) {
            const modal = this.modals.find(m => {
			if (typeof m.name === "string") return m.name === interaction.customId;

			if (m.name.startsWith) return interaction.customId.startsWith(m.name.startsWith);
			if (m.name.endsWith) return interaction.customId.endsWith(m.name.endsWith);
			if (m.name.includes) return interaction.customId.includes(m.name.includes);

			return false;
		});

            if (!modal) return;
            if (!modal.modalResponse) await interaction.deferReply({ ephemeral: true });

            const modalName = typeof modal.name === "string" ?
                  modal.name :
                  Object.values(modal.name)[0];

            if (!await RestrictionUtils.verifyAccess(modal.restriction, interaction.member as GuildMember)) {
                  interaction.editReply({
                        content:
                              `You are **below** the required restriction level for this modal: \`${RestrictionLevel[modal.restriction]}\`\n`
                              + `Your restriction level: \`${await RestrictionUtils.getRestrictionLabel(interaction.member as GuildMember)}\``,
                  });
                  return;
            }
            
            try {
                  await modal.execute(interaction, this.client);
                  console.log(`%s "${modalName}" executed by ${interaction.user.tag} %s`, Properties.cli.modules.modals, clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
            } catch (err) {
                  console.log(`Failed to execute modal: ${modal.name}`);
                  console.error(err);
            }
      }
}