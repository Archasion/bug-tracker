import {
    AutocompleteInteraction,
    PermissionResolvable,
    PermissionFlagsBits,
    PermissionsBitField,
    GuildMember,
    Interaction,
    NewsChannel,
    TextChannel
} from "discord.js";

export const SubmissionChannelPermissions = {
    BugReports: [
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageThreads,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks
    ],
    Suggestions: [
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.CreatePublicThreads,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageThreads,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks
    ],
    PlayerReports: [
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.EmbedLinks
    ]
};

export enum ReplyType {
    Update = 0,
    Reply = 1,
    EditReply = 2
}

interface VerifyPermissionsData {
    interaction: Exclude<Interaction, AutocompleteInteraction>;
    permissions: PermissionResolvable[];
    channel: TextChannel | NewsChannel;
    replyType: ReplyType;
}

export default class PermissionUtils {
    public static async verifyPermissions(data: VerifyPermissionsData): Promise<boolean> {
        const {interaction, permissions, channel, replyType} = data;

        const client = interaction.guild?.members.me as GuildMember;
        const missingPermissionsBits = permissions.filter(permission => !client.permissionsIn(channel).has(permission));

        if (missingPermissionsBits.length === 0) return true;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const missingPermissions = new PermissionsBitField(missingPermissionsBits.reduce((a, b) => a + b)).toArray();

        switch (replyType) {
            case ReplyType.EditReply: {
                await interaction.editReply(`I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``);
                break;
            }

            case ReplyType.Reply: {
                await interaction.reply({
                    content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
                    ephemeral: true
                });
                break;
            }

            case ReplyType.Update: {
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