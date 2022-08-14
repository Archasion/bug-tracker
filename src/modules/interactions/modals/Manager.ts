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
      modals: Collection<string | { startsWith: string } | { endsWith: string } | { includes: string }, Modal>;

      constructor(client: Bot) {
            this.client = client;
            this.modals = new Collection();
      }

      public async load() {
            const files = fs.readdirSync(path.join(__dirname, "../../../interactions/modals"))
                  .filter(file => file.endsWith(".js"));

            for (const file of files) {
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const modal = require(path.join(__dirname, "../../../interactions/modals", file)).default;
                  new modal(this.client);
            }
      }

      public async register(modal: Modal) {
            this.modals.set(modal.name, modal);

            const modalName = typeof modal.name === "string" ?
                  modal.name :
                  Object.values(modal.name)[0];

            console.log(`%s Registered modal: "${modalName}"`, Properties.cli.modules.modals);
      }

      public async handle(interaction: ModalSubmitInteraction) {
            const modal = this.modals.find(m => {
			if (typeof m.name === "string") return m.name === interaction.customId;

			if ((m.name as { startsWith: string }).startsWith) return interaction.customId.startsWith((m.name as { startsWith: string }).startsWith);
			if ((m.name as { endsWith: string }).endsWith) return interaction.customId.endsWith((m.name as { endsWith: string }).endsWith);
			if ((m.name as { includes: string }).includes) return interaction.customId.includes((m.name as { includes: string }).includes);

			return false;
		});

            if (!modal) return;

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
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  await modal.execute(interaction, this.client);
                  console.log(`%s "${modalName}" executed by ${interaction.user.tag} %s`, Properties.cli.modules.modals, clc.blackBright(`("${interaction.guild?.name}" • ${interaction.guildId})`));
            } catch (err) {
                  console.log(`Failed to execute modal: ${modal.name}`);
                  console.error(err);
            }
      }
}