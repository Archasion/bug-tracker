import Properties from "../data/Properties";

export default class ValidationUtils {
      public static isBotChannel(channelId: string): boolean {
            return Object.values(Properties.channels.bot).includes(channelId);
      }
}