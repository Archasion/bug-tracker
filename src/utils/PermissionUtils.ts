import { AutocompleteInteraction, GuildMember, Interaction, NewsChannel, PermissionResolvable, TextChannel, PermissionsBitField } from "discord.js";
 
export default class PermissionUtils {
      public static async botHasPermissions(interaction: Exclude<Interaction, AutocompleteInteraction>, permissions: PermissionResolvable[], channel: TextChannel | NewsChannel = interaction.channel as TextChannel | NewsChannel): Promise<boolean> {
            const client = interaction.guild?.members.me as GuildMember;
            const missingPermissionsBits = permissions
                .filter(permission => !client.permissionsIn(channel).has(permission))
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .reduce((a, b) => a + b);

            const missingPermissions = new PermissionsBitField(missingPermissionsBits).toArray();

            if (missingPermissions.length > 0) {
                  await interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``)
                  .catch(async () => {
                        await interaction.reply({
                              content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                              ephemeral: true
                        });
                  });
                  
                  return false;
            }

            return true;
      }
}