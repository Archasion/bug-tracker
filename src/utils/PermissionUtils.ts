import { AutocompleteInteraction, GuildMember, Interaction, NewsChannel, PermissionResolvable, TextChannel } from "discord.js";
 
export default class PermissionUtils {
      public static async botHasPermissions(interaction: Exclude<Interaction, AutocompleteInteraction>, permissions: PermissionResolvable[], channel: TextChannel | NewsChannel = interaction.channel as TextChannel | NewsChannel): Promise<boolean> {
            const client = interaction.guild?.members.me as GuildMember;
            const missingPermissions = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

            if (missingPermissions.length > 0) {
                  try {
                        interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``);
                  } catch {
                        interaction.reply({
                              content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                              ephemeral: true
                        });
                  }
                  return false;
            }

            return true;
      }
}