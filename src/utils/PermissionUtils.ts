import {
    AutocompleteInteraction,
    PermissionResolvable,
    PermissionsBitField,
    GuildMember,
    Interaction,
    NewsChannel,
    TextChannel
} from "discord.js";

export default class PermissionUtils {
    public static async botHasPermissions(
        interaction: Exclude<Interaction, AutocompleteInteraction>,
        permissions: PermissionResolvable[],
        channel: TextChannel | NewsChannel = interaction.channel as TextChannel | NewsChannel
    ): Promise<boolean> {
        const client = interaction.guild?.members.me as GuildMember;
        const missingPermissionsBits = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

        if (missingPermissionsBits.length === 0) return true;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const missingPermissions = new PermissionsBitField(missingPermissionsBits.reduce((a, b) => a + b)).toArray();

        await interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``)
            .catch(async () => {
                await interaction.reply({
                    content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                    ephemeral: true
                });
            });

        return false;
    }
}