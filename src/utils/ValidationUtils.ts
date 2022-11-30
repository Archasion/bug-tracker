import Properties from "../data/Properties";
import {ChannelType} from "discord.js";

export default class ValidationUtils {
    public static isContactChannel(channelId: string): boolean {
        return Object.values(Properties.channels.contact).includes(channelId);
    }

    public static isTextOrNewsChannel(channelType: ChannelType): boolean {
        return channelType === ChannelType.GuildText || channelType === ChannelType.GuildNews;
    }
}