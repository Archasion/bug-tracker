import { ChatInputCommandInteraction, GuildChannelResolvable, GuildMember, NewsChannel, PermissionResolvable, TextChannel } from "discord.js";
 
export default class PermissionUtils {
      public static async botHasPermissions(interaction: ChatInputCommandInteraction, permissions: PermissionResolvable[], channel: TextChannel | NewsChannel = interaction.channel as TextChannel): Promise<boolean> {
            const client = interaction.guild?.members.me as GuildMember;
            const missingPermissions = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

            if (missingPermissions.length > 0) {
                  interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``);
                  return false;
            }

            return true;
      }
}