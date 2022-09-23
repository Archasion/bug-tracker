import Button from "../../modules/interactions/buttons/Button";
import Bot from "../../Bot";

import {
      ComponentEmojiResolvable,
      SelectMenuComponent,
      ButtonInteraction,
      SelectMenuBuilder,
      ActionRowBuilder,
      ButtonBuilder,
      ButtonStyle,
      ActionRow
} from "discord.js";

import { RestrictionLevel } from "../../utils/RestrictionUtils";
import {BugStatus, SuggestionStatus, PlayerReportStatus, SubmissionStatus} from "../../data/Types";

import Properties from "../../data/Properties";

const suggestionStatuses: { label: string, value: SuggestionStatus, emoji: ComponentEmojiResolvable }[] = [
      {
            label: "Approved",
            value: "approved",
            emoji: Properties.emojis.approve
      },
      {
            label: "Rejected",
            value: "rejected",
            emoji: Properties.emojis.reject
      },
      {
            label: "Implemented",
            value: "implemented",
            emoji: Properties.emojis.implemented
      },
      {
            label: "Considered",
            value: "considered",
            emoji: Properties.emojis.considered
      },
      {
            label: "None",
            value: "none",
            emoji: Properties.emojis.none
      }
];

const bugStatuses: { label: string, value: BugStatus, emoji: ComponentEmojiResolvable }[] = [
      {
            label: "Approved",
            value: "approved",
            emoji: Properties.emojis.approve
      },
      {
            label: "Rejected",
            value: "rejected",
            emoji: Properties.emojis.reject
      },
      {
            label: "Fixed",
            value: "fixed",
            emoji: Properties.emojis.fixed
      },
      {
            label: "Considered",
            value: "considered",
            emoji: Properties.emojis.considered
      },
      {
            label: "None",
            value: "none",
            emoji: Properties.emojis.none
      }
];

const playerReportStatuses: { label: string, value: PlayerReportStatus, emoji: ComponentEmojiResolvable }[] = [
      {
            label: "Approved",
            value: "approved",
            emoji: Properties.emojis.approve
      },
      {
            label: "Rejected",
            value: "rejected",
            emoji: Properties.emojis.reject
      },
      {
            label: "Considered",
            value: "considered",
            emoji: Properties.emojis.considered
      },
      {
            label: "None",
            value: "none",
            emoji: Properties.emojis.none
      }
];


export default class ApproveButton extends Button {
      constructor(client: Bot) {
            super(client, {
                  name: "set-status",
                  restriction: RestrictionLevel.Moderator
            });
      }

      /**
       * @param {ButtonInteraction} interaction
       * @returns {Promise<void>}
       */
      async execute(interaction: ButtonInteraction): Promise<void> {
            const [embed] = interaction.message.embeds;
            const submissionType = embed.title;
            let submissionOptions: { label: string, value: SubmissionStatus }[] = suggestionStatuses;

            switch (submissionType) {
                  case "Bug Report": {
                        submissionOptions = bugStatuses;
                        break;
                  }
                  case "Player Report": {
                        submissionOptions = playerReportStatuses;
                        break;
                  }
            }

            const statusOptions = new SelectMenuBuilder()
                  .setCustomId(`set-status-${interaction.message.id}`)
                  .setPlaceholder("Select the new submission status...")
                  .setOptions(submissionOptions);

            const setReasonButton = new ButtonBuilder()
                  .setCustomId(`set-reason-${interaction.message.id}`)
                  .setLabel("Set Reason")
                  .setStyle(ButtonStyle.Secondary);

            const selectMenuActionRow = new ActionRowBuilder().setComponents(statusOptions);
            const buttonActionRow = new ActionRowBuilder().setComponents(setReasonButton);

            await interaction.editReply({
                  content: "Use the selection menu below to choose a new status:",
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  components: [selectMenuActionRow.toJSON(), buttonActionRow.toJSON()]
            });
            return;
      }
}