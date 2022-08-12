import { CommandInteraction, GuildMember, MessageComponentInteraction, NewsChannel, PermissionResolvable, TextChannel } from "discord.js";
 
export default class PermissionUtils {
      public static async botHasPermissions(interaction: CommandInteraction | MessageComponentInteraction, permissions: PermissionResolvable[], channel: TextChannel | NewsChannel = interaction.channel as TextChannel | NewsChannel): Promise<boolean> {
            const client = interaction.guild?.members.me as GuildMember;
            const missingPermissions = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

            if (missingPermissions.length > 0) {
                  interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``);
                  return false;
            }

            return true;
      }
}