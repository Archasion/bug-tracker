import {
    AutocompleteInteraction,
    PermissionResolvable,
    PermissionsBitField,
    GuildMember,
    Interaction,
    NewsChannel,
    TextChannel
} from "discord.js";

interface BotHasPermissionsData {
    interaction: Exclude<Interaction, AutocompleteInteraction>;
    permissions: PermissionResolvable[];
    channel: TextChannel | NewsChannel;
    replyType: "Update" | "Reply" | "EditReply";
}

export default class PermissionUtils {
    public static async botHasPermissions(data: BotHasPermissionsData): Promise<boolean> {
        const { interaction, permissions, channel, replyType } = data;

        const client = interaction.guild?.members.me as GuildMember;
        const missingPermissionsBits = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

        if (missingPermissionsBits.length === 0) return true;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const missingPermissions = new PermissionsBitField(missingPermissionsBits.reduce((a, b) => a + b)).toArray();

        switch (replyType) {
            case "EditReply": {
                await interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``);
                break;
            }

            case "Reply": {
                await interaction.reply({
                    content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                    ephemeral: true
                });
                break;
            }

            case "Update": {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                await interaction.update({
                    content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                    components: [],
                    files: []
                });
            }
        }

        return false;
    }
}